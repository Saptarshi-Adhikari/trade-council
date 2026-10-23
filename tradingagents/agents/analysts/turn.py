"""One turn of a tool-using analyst, and its last turn once its tool rounds are spent."""

import json
import logging

from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

logger = logging.getLogger(__name__)

WRAP_UP = (
    "You have used every tool round this report allows. Write your final report "
    "now from the tool results above, and say which data you could not retrieve."
)

_EMPTY_RETRY_NUDGE = (
    "Please respond with your analysis now. Write at least one sentence summarising "
    "what you know so far, or call one of the available tools to gather data."
)


def _is_empty(result) -> bool:
    """True when the model returned neither text nor tool calls.

    An empty response crashes LangGraph with:
      'model output must contain either output text or tool calls'
    This predicate detects it so the caller can recover before that happens.
    """
    content = result.content
    empty_content = not content or (isinstance(content, str) and not content.strip())
    no_tool_calls = not getattr(result, "tool_calls", None)
    return empty_content and no_tool_calls


def take_turn(prompt, llm, tools, messages):
    """The analyst's reply and its report, which stays empty while it calls tools.

    Told to wrap up, it answers without tools: a model offered tools may call one
    whatever it is told. Its earlier calls and their results reach it as text,
    since a provider may refuse a history holding tool calls when none are bound.

    If the first invocation returns an empty response (no text and no tool calls,
    which would crash LangGraph with "model output must contain either output text
    or tool calls"), a single retry is attempted without tool binding. This
    recovers from the occasional empty completion produced by local Ollama models
    such as gemma4:e2b.
    """
    if messages and isinstance(messages[-1], HumanMessage) and messages[-1].content == WRAP_UP:
        # The prompt lists the tools it offers; a model told of tools it cannot
        # call may still try, and some providers then answer with nothing.
        prompt = prompt.partial(tool_names="none; your tool rounds are spent")
        result = (prompt | llm).invoke(_as_text(messages))
        if _is_empty(result):
            logger.warning(
                "take_turn: wrap-up turn returned empty content; retrying with nudge."
            )
            nudge = list(_as_text(messages)) + [HumanMessage(content=_EMPTY_RETRY_NUDGE)]
            result = (prompt | llm).invoke(nudge)
        if _is_empty(result):
            logger.error(
                "take_turn: wrap-up retry also returned empty content; substituting placeholder."
            )
            result.content = (
                "No output was produced by the model for this wrap-up turn. "
                "Proceeding with the information gathered in previous steps."
            )
        return result, result.content

    result = (prompt | llm.bind_tools(tools)).invoke(messages)

    if _is_empty(result):
        # The model returned nothing — retry without tool binding so it produces text.
        logger.warning(
            "take_turn: tool-bound turn returned empty content (no text, no tool calls); "
            "retrying as plain text to avoid LangGraph empty-output error."
        )
        plain_prompt = prompt.partial(
            tool_names="none (tool round failed; write what you know so far)"
        )
        nudge_messages = list(_as_text(messages)) + [HumanMessage(content=_EMPTY_RETRY_NUDGE)]
        result = (plain_prompt | llm).invoke(nudge_messages)
        if _is_empty(result):
            # If it is still empty after the retry, manufacture a placeholder so the
            # pipeline can continue rather than raising an opaque LangGraph error.
            logger.error(
                "take_turn: retry also returned empty content; substituting placeholder."
            )
            result.content = (
                "No output was produced by the model for this turn. "
                "Proceeding with available information from previous steps."
            )

    return result, "" if result.tool_calls else result.content


def _as_text(messages):
    """The history with its tool calls and tool results written out as plain messages."""
    written = []
    for message in messages:
        if isinstance(message, AIMessage) and message.tool_calls:
            said = message.content if isinstance(message.content, str) else ""
            calls = "; ".join(
                f"{c['name']}({json.dumps(c['args'], default=str)})"
                for c in message.tool_calls
            )
            written.append(AIMessage(content=f"{said}\n[Called {calls}]".strip()))
        elif isinstance(message, ToolMessage):
            written.append(
                HumanMessage(content=f"[{message.name or 'Tool'} returned]\n{message.content}")
            )
        else:
            written.append(message)
    return written
