PRICE_WHISPER_PER_MIN = 0.006  # USD / minute (whisper-1)
PRICE_GPT4O_MINI_PER_M_INPUT = 0.60   # USD / 1M input tokens
PRICE_GPT4O_MINI_PER_M_OUTPUT = 2.40  # USD / 1M output tokens

def est_llm_cost(input_tokens: int, output_tokens: int) -> float:
    return (input_tokens / 1_000_000.0) * PRICE_GPT4O_MINI_PER_M_INPUT + \
           (output_tokens / 1_000_000.0) * PRICE_GPT4O_MINI_PER_M_OUTPUT
