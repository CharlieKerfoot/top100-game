## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

## List topics

The 10 list topics are **final** and must not be changed, added to, or removed:

`entertainment`, `education`, `film & tv`, `geography`, `internet`, `misc`, `business`, `music`, `sports`, `food`

Additionally, `new` and `top50` are meta-topics describing list format, not content categories.

When creating new lists, assign one or two of the above topics. If a list doesn't fit any specific topic, use `misc`. Never introduce new topics.

## Lists and Hints
Hints are search bar autocomplete suggestions. There must be far more possible suggestions than actual answers otherwise the game is too easy. It should not be difficult to get a strike.

For Top 100 Lists, there should be at the very least 500+ hints (for fixed groups like countries, every possible answer is adequate). The aim should really be for 750-1000 if possible.
For Top 50 Lists, the bare minimum should be 250. Again, aim for at least 500 is possible.

Make sure that all hints are unique (no duplicates) and don't repeat with difference in punctuation or capitalization either.
