# Stylelint Plugin Property

[![tests](https://github.com/electrovir/stylelint-plugin-property/actions/workflows/virmator-tests.yml/badge.svg?branch=main)](https://github.com/electrovir/stylelint-plugin-property/actions/workflows/virmator-tests.yml)

Stylelint plugin for managing arbitrary properties.

# Rules

Go to each rule's page (click on the name below) to see specific details.

| Rule                               | auto-fix   |
| ---------------------------------- | ---------- |
| `plugin-property/block-properties` | no &cross; |

# Rule Options

-   Object input with exceptions. At least one of `properties` or `detailedProperties` must be defined.

    ```javascript
    {
        "mode": "block",
        // optional: list of property names that are outright blocked
        properties: ['float'],
        // optional: list of properties with exceptions
        detailedProperties: [
            {
                property: 'font-family',
                // For the exception to pass on any given occurrence, "selectors" must match one of
                // the selectors for the rule in question AND the value assigned to the property
                // must match at least one of the values below.
                // This is essentially an AND operation. For the equivalent OR operation, add more
                // entries to the detailedProperties array for the same property name.
                exceptions: {
                    values: ['inherit', 'unset'],
                    selectors: ['input', 'select']
                }
            }
        ],
        // optional input
        // these use glob matching with globstar turned ON
        "fileExceptions": [
            "**/*colors.less", // ignores any files ending in colors.less in any directory
            "*colors.less" // ignore files ending in colors.less only in the current directory
        ],
        // optional input
        // these use glob matching with globstar turned OFF
        "lineExceptions": [
            "*colors*", // ignores all lines that include the word colors
            "@import 'colors'" // ignores all lines that are exactly this string (don't include semicolons)
        ],
    }
    ```
