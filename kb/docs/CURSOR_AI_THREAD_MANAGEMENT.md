# Cursor AI Thread Management Guide

This document provides guidance on effectively managing Cursor AI Agent threads, maintaining valuable conversation context, and knowing when to start fresh with a new thread.

## Thread Lifecycle Management

### When to Start a New Thread

Consider starting a new thread when:

1. **Thread Performance Decreases**: When responses become noticeably slower (typically after 30-50 exchanges)
2. **Context Window Saturation**: When you've included many large files or have a lengthy conversation history
3. **Topic Shift**: When moving to an entirely different feature or component
4. **New Day/Session**: When resuming work after a significant break

### Signs of a "Heavy" Thread

Look for these indicators that your thread is becoming inefficient:

- **Slower Response Times**: Responses take significantly longer than earlier in the conversation
- **Less Detailed Answers**: Agent provides shorter, less comprehensive responses
- **Context Confusion**: Agent starts to forget details mentioned earlier
- **Tool Execution Errors**: Increased frequency of execution failures
- **Truncated Responses**: Responses cut off unexpectedly

## The Lightning Bolt Summary Function

### What Happens When You Press the Lightning Bolt

When you click the lightning bolt icon in Cursor AI:

1. **Conversation Summarization**: The AI generates a concise summary of the entire conversation
2. **Context Preservation**: Key insights, decisions, and progress are extracted
3. **Document Creation**: A new Markdown document is created in your project (typically in a temporary location)
4. **New Thread Preparation**: The summary is prepared to be used in a new thread

### Document Creation Details

The summary document:
- Is saved with a timestamped filename (e.g., `conversation-summary-2023-03-20.md`)
- Contains sections for background, key decisions, progress made, and next steps
- Can be referenced in future threads
- Is accessible through your project files

## Context Management Strategies

### Best Practices for Managing Context

1. **Strategic Document Loading**:
   - Only load files directly relevant to the current task
   - Unload large files once they're no longer needed
   - Prioritize smaller configuration files over large implementation files

2. **Periodic Cleanup**:
   - Remove files from context if they aren't needed for the current segment of work
   - Reduce the noise in the conversation by starting new threads for logically separate tasks

3. **Conversation Chunking**:
   - Use separate threads for separate features or components
   - Complete one logical unit of work before moving to the next

4. **Summary Documentation**:
   - Create specific documentation summarizing important context
   - Reference these documents across threads for continuity

### Maintaining Conversation Context Across Threads

1. **Use the Lightning Bolt Summary**:
   - Start new threads with the generated summary
   - Reference the summary document in your initial prompt

2. **Create Dedicated Context Documents**:
   - Maintain a running project status document
   - Update it with key decisions and progress

3. **Reference Previous Work**:
   - Begin new threads by referencing specific documents or summaries
   - Include the path to previous conversation summaries

## Summary Prompt Template

Use this prompt to generate a comprehensive conversation summary:

```
Please create a detailed summary of our conversation that I can use to maintain context in future threads. Include:

1. BACKGROUND: Brief overview of the project/feature we're working on
2. KEY DECISIONS: Important technical choices and rationales
3. PROGRESS: What we've accomplished so far (code changes, configurations)
4. CHALLENGES: Any obstacles encountered and solutions tried
5. NEXT STEPS: Remaining tasks and future direction
6. REFERENCE CODE: Small snippets of critical code patterns established

Format this as a Markdown document with clear headings, bullet points, and code blocks where appropriate. This summary will be used to onboard a new AI thread with our current context.
```

## Thread Transition Example

### Ending the Current Thread

```
Our thread is getting heavy. Let's create a summary before starting a new thread.

Please generate a comprehensive summary of our work on [FEATURE/TASK], including:
- What we've accomplished
- Key decisions made
- Current status
- Next steps

Format it as a markdown document I can save and reference in a new thread.
```

### Starting a New Thread

```
I'm continuing work on [FEATURE/TASK] from a previous thread. Here's the context from our previous conversation:

[PASTE SUMMARY OR REFERENCE SUMMARY DOCUMENT]

Let's continue working on [SPECIFIC NEXT STEP]. Please help me with...
```

## SS4-B1 Specific Thread Management

For projects following the SmartStack v4 Branch First (SS4-B1) workflow:

1. **Thread Per Story**:
   - Ideally, use a dedicated thread for each user story
   - Include the story ID in thread summaries
   - Reference the story in the initial prompt of new threads

2. **Story Status Documentation**:
   - Update `SAAS_TEMPLATE_STATUS.md` with progress on each story
   - Reference this document when starting new threads for continuity
   - Include story status in thread summaries

3. **Branch-Aligned Threads**:
   - Align thread lifecycles with git branches when possible
   - When switching branches, consider starting a new thread
   - Include branch information in thread summaries

4. **Preview Deployment Context**:
   - Include preview deployment URLs in thread summaries
   - Reference these URLs when starting new threads for the same feature

## Conclusion

Effective thread management is essential for maintaining productivity with Cursor AI. By understanding when to start new threads, how to preserve context, and using structured summary documents, you can maintain continuity while avoiding the performance issues of overly long conversations. The lightning bolt summary feature provides a convenient way to capture key insights before starting fresh with a new, optimized thread.

Regular thread refreshes combined with good documentation practices will result in faster, more accurate assistance from the AI agent while preserving the valuable context of your ongoing work. 