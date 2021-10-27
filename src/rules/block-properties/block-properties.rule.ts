import {AtRule, Container, Rule} from 'postcss';
import {
    createDefaultRule,
    DefaultOptionMode,
    DefaultRuleOptions,
    doesMatchLineExceptions,
    RuleViolation,
} from 'stylelint-rule-creator';
import {prefix} from '../../plugin-util';

export const messages = {
    propertyBlocked(line: string, property: string) {
        return `Property "${property}" is blocked: ${line}`;
    },
    detailedPropertyBlocked(line: string, property: string, selector: string, value: string) {
        return `Property "${property}" within selector "${selector}" and value "${value}" is blocked: ${line}`;
    },
    invalidMode(mode: DefaultOptionMode) {
        return `Invalid option mode "${mode}". Only valid mode is "${DefaultOptionMode.BLOCK}"`;
    },
    missingBlockedProperties: () => 'No properties or detailProperties options were provided.',
    detailedPropertiesWithoutExceptions(propName: string) {
        return `Detailed properties were given but no exceptions were given for property "${propName}"`;
    },
};

function doesMatch(fromCss: string, criteria: string | RegExp | undefined): boolean {
    if (!criteria) {
        return false;
    }

    if (fromCss === criteria) {
        return true;
    }
    if (criteria instanceof RegExp && fromCss.match(criteria)) {
        return true;
    }

    return false;
}

/**
 * Each exception property here is treated here as an AND.
 *
 * So if, for example, the user sets both values and selectors, exceptions to the rule must fit into
 * the given values and the given selectors or it will not be exempt. If OR combinations are
 * desired, simply add more entries in the detailedProperties property of PropertyRuleOptions with
 * the same property name.
 */
export type BlockPropertyExceptions = {
    values?: (string | RegExp)[];
    selectors?: (string | RegExp)[];
};

export type BlockPropertyConfig = {
    property?: string | RegExp;
    exceptions?: BlockPropertyExceptions;
};

export type BlockPropertyRuleOptions = DefaultRuleOptions & {
    /** These properties will be blocked entirely in all uses. */
    properties?: (string | RegExp)[] | string | RegExp;
    /** These properties are blocked but have exceptions. */
    detailedProperties?: BlockPropertyConfig[] | BlockPropertyConfig;
};

function findRuleSelector(node: Container): string {
    if (node.type === 'rule') {
        return (node as Rule).selector;
    } else if (node.type === 'atrule') {
        return `@${(node as AtRule).name}`;
    } else {
        return '';
    }
}

const defaultOptions: BlockPropertyRuleOptions = {
    mode: DefaultOptionMode.BLOCK,
    properties: ['float'],
};

export const blockPropertiesRule = createDefaultRule<typeof messages, BlockPropertyRuleOptions>({
    ruleName: `${prefix}/block-properties`,
    messages,
    defaultOptions,
    ruleCallback: (report, messages, {ruleOptions, root, exceptionRegExps}) => {
        if (ruleOptions.mode !== DefaultOptionMode.BLOCK) {
            report({message: messages.invalidMode(ruleOptions.mode), node: root});
        }
        const containsProperties: boolean = !!(Array.isArray(ruleOptions.properties)
            ? ruleOptions.properties.length
            : ruleOptions.properties);

        const containsDetailedProperties: boolean = !!(Array.isArray(ruleOptions.detailedProperties)
            ? ruleOptions.detailedProperties.length
            : ruleOptions.detailedProperties);

        if (!containsProperties && !containsDetailedProperties) {
            report({message: messages.missingBlockedProperties(), node: root});
        }

        const rawProperties: (string | RegExp)[] | RegExp | string = ruleOptions.properties || [];
        const properties: (string | RegExp)[] = Array.isArray(rawProperties)
            ? rawProperties
            : [rawProperties];

        const detailedProperties: BlockPropertyConfig[] = ruleOptions.detailedProperties
            ? Array.isArray(ruleOptions.detailedProperties)
                ? ruleOptions.detailedProperties
                : [ruleOptions.detailedProperties]
            : [];

        root.walkDecls((declaration) => {
            if (doesMatchLineExceptions(declaration, exceptionRegExps)) {
                return;
            }

            // plain blocked property strings
            if (properties.some((criteria) => doesMatch(declaration.prop, criteria))) {
                return report({
                    message: messages.propertyBlocked(declaration.toString(), declaration.prop),
                    node: declaration,
                });
            }

            // detailed blocked properties with exceptions
            const relevantDetails = detailedProperties.filter((details) => {
                return doesMatch(declaration.prop, details.property);
            });
            const results = relevantDetails.map((relevant): RuleViolation | undefined => {
                if (!relevant) {
                    throw new Error(
                        `error from stylelint-plugin-property: Filtered array had length of one but first entry is not defined!??`,
                    );
                }

                const exceptions = relevant.exceptions;
                if (!exceptions || (!exceptions.selectors && !exceptions.values)) {
                    return {
                        message: messages.detailedPropertiesWithoutExceptions(declaration.prop),
                        node: root,
                    };
                }

                const ruleSelector = findRuleSelector(declaration.parent);

                const ruleSelectors: string[] = ruleSelector
                    .split(',')
                    .map((selector) => selector.trim());

                const selectorExempt = exceptions.selectors
                    ? ruleSelectors.every((ruleSelector) =>
                          exceptions.selectors!.some((criteria) =>
                              doesMatch(ruleSelector, criteria),
                          ),
                      )
                    : true;
                const valueExempt = exceptions.values
                    ? exceptions.values.some((criteria) => doesMatch(declaration.value, criteria))
                    : true;

                if (!selectorExempt || !valueExempt) {
                    return {
                        message: messages.detailedPropertyBlocked(
                            declaration.toString(),
                            declaration.prop,
                            ruleSelector,
                            declaration.value,
                        ),
                        node: declaration,
                    };
                }

                return undefined;
            });

            const someExceptionsPassed = results.some((result) => result == undefined);

            if (!someExceptionsPassed && relevantDetails.length) {
                const firstResult = results[0];
                if (!firstResult) {
                    throw new Error(
                        `First result was undefined even though we just checked that none are undefined.`,
                    );
                }
                report(firstResult);
            }
        });
    },
});
