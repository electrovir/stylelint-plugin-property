import {createDefaultRule, DefaultOptionMode, DefaultRuleOptions} from 'stylelint-rule-creator';
import {prefix} from '../../plugin-util';

const messages = {
    extensionRequired(line: string, property: string) {
        return `Property "${property}" is blocked: ${line}`;
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
    property: string;
    exceptions?: BlockPropertyExceptions;
};

export type BlockPropertyRuleOptions = DefaultRuleOptions & {
    properties: string[];
    detailedProperties?: BlockPropertyConfig | BlockPropertyConfig[];
};

const defaultOptions: BlockPropertyRuleOptions = {
    mode: DefaultOptionMode.BLOCK,
    properties: [],
};

export const blockPropertyRule = createDefaultRule<typeof messages, BlockPropertyRuleOptions>({
    ruleName: `${prefix}/property`,
    messages,
    defaultOptions,
    ruleCallback: (report, messages, {ruleOptions, root, context, exceptionRegExps}) => {},
});
