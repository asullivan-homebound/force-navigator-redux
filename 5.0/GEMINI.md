# Gemini CLI Instructions

To ensure consistent performance and adherence to project standards, the Gemini agent must ALWAYS read the following directories and files before proceeding with any task:

1.  **`.ai/context/`**: Contains the project's technical stack, coding standards, and product context.
    *   *Critical:* `tech-stack.md` (Coding Standards & Agent Instructions)
    *   *Critical:* `product.md` (Product Vision & User Flows)
2.  **`.ai/protocols/`**: Contains workflow definitions and protocols.
    *   *Example:* `architect-protocol.md` (Architect Protocol)

## How to Initialize

At the start of every session, the agent should:
1.  List the contents of `.ai/context/` and `.ai/protocols/`.
2.  Read all relevant files within those directories.

This ensures the agent is fully grounded in the project's specific conventions and requirements.