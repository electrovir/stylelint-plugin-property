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
    invalidMode(mode: DefaultOptionMode) {
        return `Invalid option mode "${mode}". Only valid mode is "${DefaultOptionMode.BLOCK}"`;
    },
    missingBlockedProperties: () => 'No properties or detailProperties options were provided.',
    detailedPropertiesWithoutExceptions(propName: string) {
        return `Detailed properties were given but no exceptions were given for property "${propName}"`;
    },
};

/**
 * Each exception property here is treated here as an AND.
 *
 * So if, for example, the user sets both values and selectors, exceptions to the rule must fit into
 * the given values and the given selectors or it will not be exempt. If OR combinations are
 * desired, simply add more entries in the detailedProperties property of PropertyRuleOptions with
 * the same property name.
 */
export type BlockPropertyExceptions = {
    values?: string[];
    selectors?: string[];
};

export type BlockPropertyConfig = {
    property?: string;
    exceptions?: BlockPropertyExceptions;
};

export type BlockPropertyRuleOptions = DefaultRuleOptions & {
    /** These properties will be blocked entirely in all uses. */
    properties: string[] | string;
    /** These properties are blocked but have exceptions. */
    detailedProperties?: BlockPropertyConfig | BlockPropertyConfig[];
};

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
        const containsProperties: boolean = !!(
            ruleOptions.properties && ruleOptions.properties.length
        );

        const containsDetailedProperties: boolean = !!(Array.isArray(ruleOptions.detailedProperties)
            ? ruleOptions.detailedProperties.length
            : ruleOptions.detailedProperties);

        if (!containsProperties && !containsDetailedProperties) {
            report({message: messages.missingBlockedProperties(), node: root});
        }

        const rawProperties: string | string[] = ruleOptions.properties || [];
        const properties: string[] = Array.isArray(rawProperties) ? rawProperties : [rawProperties];

        const detailedProperties: BlockPropertyConfig[] = ruleOptions.detailedProperties
            ? Array.isArray(ruleOptions.detailedProperties)
                ? ruleOptions.detailedProperties
                : [ruleOptions.detailedProperties]
            : [];

        root.walkRules((rule) => {
            rule.walkDecls((declaration) => {
                if (doesMatchLineExceptions(declaration, exceptionRegExps)) {
                    return;
                }

                // plain blocked property strings
                if (properties.includes(declaration.prop)) {
                    return report({
                        message: messages.propertyBlocked(declaration.toString(), declaration.prop),
                        node: declaration,
                    });
                }

                // detailed blocked properties with exceptions
                const relevantDetails = detailedProperties.filter((details) => {
                    return details.property === declaration.prop;
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

                    const ruleSelectors: string[] = rule.selector
                        .split(',')
                        .map((selector) => selector.trim());

                    const selectorExempt = exceptions.selectors
                        ? ruleSelectors.every((ruleSelector) =>
                              exceptions.selectors!.includes(ruleSelector),
                          )
                        : true;
                    const valueExempt = exceptions.values
                        ? exceptions.values.includes(declaration.value)
                        : true;

                    if (!selectorExempt || !valueExempt) {
                        return {
                            message: messages.propertyBlocked(
                                declaration.toString(),
                                declaration.prop,
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
        });
    },
});
