# Cursor

- [.cursorrules file recommendations](https://cursor.directory/rules/typescript)
- [voice to text](https://wisprflow.ai/workflow/push-prs-and-get-your-steps-in)

- Cursor is fork of VsCode.
Shortcuts:
- `cmd`+`shift`+`p`: open command pannel
- `cmd`+ L: toggle cursor tab-agent
Here's a cleaner and more concise version of your notes about Cursor rules:

# Types of Cursor Rules

## 1. Project Rules
Located in `.cursor/rules` directory, with four types:
- **Manual**: Must be explicitly added to agent/chat
- **Always**: Automatically included in both agent/chat
- **Agent Requested**: Inclusion depends on agent (requires description)
- **Auto Attached**: [Note: This section was incomplete in your notes]

**Nested Rules Structure**:
- Organize by context (e.g., `/frontend/`, `/backend/`)
- Helps maintain better rule organization

**Creating Project Rules**:
- Option 1: `CMD + SHIFT + P` → "new rule"
- Option 2: Use `/generate cursor rule` in chat/agent

## 2. User Rules
- Apply globally across all prompts
- Define agent tone and style preferences
- Used in all conversations

## 3. CursorRules (Legacy)
- Old method of defining rules
- Located in root directory
- [Considered legacy/deprecated]

**Resource**: Browse recommended rules at [cursor.directory](https://cursor.directory/)

Is there anything specific from these notes you'd like me to clarify or expand upon?


