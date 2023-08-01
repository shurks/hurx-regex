/**
 * All possible combinations of a series of letters, without
 * using a letter more than once.
 * 
 * @author Stan Hurks
 */
export type UniqueCombinations<All extends string, Used extends string = ''> = ReturnType<() => {
    [Key in All]: Key extends Used
        ? never
        : Key | `${Key}${UniqueCombinations<All, Used | Key>}`
}>[All]

/**
 * Options after flags
 */
export type RegexBuilderPropertiesAfterFlags = 'toRegExp' | 'toSource'

/**
 * The properties that and `Regex.or` return as type.
 */
export type RegexBuilderPropertiesNested = RegexBuilderPropertiesNestedAll
    | RegexBuilderPropertiesNestedAfterQuantifier
    | RegexBuilderPropertiesNestedAfterOptional

/**
* All options
*/
export type RegexBuilderPropertiesNestedAll = 'or'|'setQuantifier'|'setOptional'

/**
* Options after the quantifier
*/
export type RegexBuilderPropertiesNestedAfterQuantifier = 'setOptional'

/**
 * Options after optional
 */
export type RegexBuilderPropertiesNestedAfterOptional = never

/**
* Shortcut for the functions.
*/
export type PickRegex<Aliases extends string = never, OptionalAliases extends string = never, NamedGroups extends string = never> = Pick<Regex<Aliases, OptionalAliases, NamedGroups>, RegexBuilderPropertiesNestedAll>
    | Pick<Regex<Aliases, OptionalAliases>, RegexBuilderPropertiesNestedAfterQuantifier>
    | RegexBuilderPropertiesNestedAfterOptional

/**
* All regex flags
*/
export type RegexFlags = 'i' | 'g' | 'm' | 's' | 'u' | 'y'

/**
 * Regex helper functions
 */
export type RegexHelpers<Aliases extends string = never, OptionalAliases extends string = never, NamedGroups extends string = never> = Pick<Regex<Aliases, OptionalAliases, NamedGroups>, 'lookahead'|'lookbehind'|'negativeLookahead'|'negativeLookbehind'|'captureGroups'>

/**
 * All regex matches for all capture groups given
 */
export type RegexMatchesPerCaptureGroup<Groups extends string> = {
    /**
     * The value per capture group
     */
    [group in Groups]: {
        /**
         * The value of the match
         */
        match: string
        /**
         * The index at where the match starts in the string
         */
        index: number
        /**
         * The length of the match
         */
        length: number
    }
}

/**
 * The options for `Regex.capture`
 */
export type RegexCaptureOptions<Aliases extends string = never, OptionalAliases extends string = never, NamedGroups extends string = never> = {
    /**
     * The aliases forming groups to create the full regex,
     * this can be empty but then all aliases of the builder
     * object will be used in the order that you've added them
     * to form one regex to match the groups against.
     */
    groups: Record<NamedGroups, Regex<Aliases, OptionalAliases, NamedGroups>>

    /**
     * The regex flags to keep in mind during the captures.
     */
    flags: UniqueCombinations<RegexFlags> | null

    /**
     * Whether to capture from the begin and/or to the end.
     * When the value is undefined, no restrictions will be applied.
     */
    captureMode: 'from-begin' | 'until-end' | 'from-begin-until-end' | 'none'

    /**
     * If strict mode is set to true, the capture groups must exactly match each other
     * right after each other. Otherwise it's allowed for other characters to be
     * in between the captures.
     */
    strictMode: boolean
}

/**
 * The properties that can be used when using `Regex.alias`
 */
export type RegexAliasPick<Aliases extends string, OptionalAliases extends string, NamedGroups extends string> = Pick<Regex<Aliases, OptionalAliases, NamedGroups>, 'alias'|'group'|'setFlags'|'capture'|'toRegExp'|'toSource'|'utils'>

/**
 * The properties that can be used when using `Regex.group`
 */
export type RegexGroupPick<Aliases extends string, OptionalAliases extends string, NamedGroups extends string> = Pick<Regex<Aliases, OptionalAliases, NamedGroups>, 'group'|'skip'|'capture'>

/**
 * The type for a regex callback function
 */
export type RegexCallback<Aliases extends string = never, OptionalAliases extends string = never, NamedGroups extends string = never> = 
    RegExp 
    | number
    | boolean
    | {toString(): string} & object
    | Pick<Regex<Aliases, OptionalAliases, NamedGroups>, RegexBuilderPropertiesNested>
    | Aliases
    | OptionalAliases
    | NamedGroups
    | (() => string)
    | RegexCallbackFunction<Aliases, OptionalAliases, NamedGroups>
    
/**
 * The type for a regex callback function as a function
 */
export type RegexCallbackFunction<Aliases extends string, OptionalAliases extends string, NamedGroups extends string> = 
    (
        options: {
            regex: (...args: RegexCallbackFunctionRegexArgParameter<Aliases, OptionalAliases, NamedGroups>[]) => Pick<Regex<Aliases, OptionalAliases, NamedGroups>, RegexBuilderPropertiesNestedAll>,
            helpers: RegexHelpers<Aliases, OptionalAliases, NamedGroups>,
            variable: (variable: string|number|boolean|{toString(): string}) => string
        }
    ) => PickRegex<Aliases, OptionalAliases, NamedGroups>

/**
 * The arg parameter for the regex callback function
 */
export type RegexCallbackFunctionRegexArgParameter<Aliases extends string = never, OptionalAliases extends string = never, NamedGroups extends string = never> =
    RegExp
    | PickRegex<Aliases, OptionalAliases, NamedGroups>
    | Aliases
    | OptionalAliases
    | NamedGroups
    | (() => string)
    | number
    | boolean
    | ({toString(): string} & object)


/**
 * A module for building regexes
 * 
 * @author Stan Hurks
 */
export default class Regex<Aliases extends string = never, OptionalAliases extends string = never, NamedGroups extends string = never> {      
    /**
     * The children of the regex
     */
    private children: Regex<Aliases, OptionalAliases, NamedGroups>[] = []

    /**
     * The regex of this instance, will only be set
     * if there is 1 argument provided in the constructor
     * and if that argument is an instance of `RegExp`
     */
    private regex: RegExp | null = null

    /**
     * Regexes used in an or statement for this regex instance.
     */
    private orStatements: Regex<Aliases, OptionalAliases, NamedGroups>[] = []

    /**
     * Whether or not this regex is optional
     */
    private optional: boolean = false

    /**
     * Whether or not a plus sign is used
     */
    private plusSign: boolean = false

    /**
     * The suffix
     */
    private quantifier: string | null = null

    /**
     * Unlimited quantifier (*)
     */
    private quantifierAsterix: boolean = false

    /**
     * All except the regex given
     */
    private allExcept: boolean = false

    /**
     * All aliases for sub-regexes within this regex.
     */
    private aliases: Record<Aliases|OptionalAliases, Regex<Aliases, OptionalAliases, NamedGroups>> = {} as any

    /**
     * All aliases for sub-regexes within this regex.
     */
    private groups: Record<NamedGroups, Regex<Aliases, OptionalAliases, NamedGroups>> = {} as any

    /**
     * The specified flags using `this.flags()` or `Regex.flags()`
     */
    private flags: UniqueCombinations<RegexFlags>|null = null

    /**
     * Skips a group when capturing
     */
    private _skip: boolean = false

    /**
     * The parent
     */
    private parent: Regex<Aliases, OptionalAliases, NamedGroups>|null = null

    private constructor(...children: Array<RegExp | Regex<Aliases, OptionalAliases, NamedGroups> | string | number | {toString(): string} | boolean>) {
        if (children.length === 1 && children[0] instanceof RegExp) {
            this.regex = children[0]
        }
        else if (children.length) {
            children.forEach((child) => {
                const regex = child instanceof RegExp
                    ? new Regex<Aliases, OptionalAliases, NamedGroups>(child)
                    : child instanceof Regex
                        ? child
                        : Regex.parseVariable(child)
                regex.parent = this
                this.children.push(regex as any)
            })
        }
    }

    //#region Getters
    /**
     * Get helpful utils to create your regexes, however it is recommended that
     * you create some aliases first with `Regex.alias`.
     * @returns regex helper functions
     */
    public static get utils() {
        return new Regex().utils
    }
    /**
     * Get helpful utils to create your regexes
     * @returns regex helper functions
     */
    public get utils(): {
        helpers: RegexHelpers<Aliases, OptionalAliases, NamedGroups>
        regex: (...args: RegexCallbackFunctionRegexArgParameter<Aliases, OptionalAliases, NamedGroups>[]) => Pick<Regex<Aliases, OptionalAliases, NamedGroups>, RegexBuilderPropertiesNested>
        compile: (...args: RegexCallbackFunctionRegexArgParameter<Aliases, OptionalAliases, NamedGroups>[]) => RegExp
        source: (...args: RegexCallbackFunctionRegexArgParameter<Aliases, OptionalAliases, NamedGroups>[]) => string
    }{
        const regex = (...args: RegexCallbackFunctionRegexArgParameter<Aliases, OptionalAliases, NamedGroups>[]) => this.callback(...args)
        return {
            helpers: this,
            regex,
            compile: (...args: RegexCallbackFunctionRegexArgParameter<Aliases, OptionalAliases, NamedGroups>[]) => (regex(...args) as any).compile(),
            source: (...args: RegexCallbackFunctionRegexArgParameter<Aliases, OptionalAliases, NamedGroups>[]) => (regex(...args) as any).compile().source,
        }
    }

    /**
     * Get all flags used within the regex node
     * @returns The flags
     */
    private getFlags = (): UniqueCombinations<RegexFlags> => {
        if (this.flags) {
            return this.flags
        }
        const findFlags = (regex: Regex<Aliases, OptionalAliases, NamedGroups>): string[] => {
            if (regex.regex) {
                return regex.regex.flags.split('')
            }
            else {
                const flags: string[][] = []
                for (const child of regex.children) {
                    if (child.regex) {
                        flags.push(child.regex.flags.split(''))
                    }
                    else {
                        flags.push(findFlags(child))
                    }
                }
                return flags.reduce((x, y) => x.concat(y), [])
            }
        }
        return findFlags(this).filter((v, i, a) => a.indexOf(v) === i).join('') as UniqueCombinations<RegexFlags>
    }
    //#endregion

    //#region Captures
    /**
     * Combines aliases together in a regex to create an array of captures.
     * 
     * See the static `Regex.capture` method.
     * @see capture
     * 
     * @param data The string of data to create the captures from 
     * @param options The options for creating the captures, with additional options and an array of groups, but they are all filled with default values
     */
    public capture (
        data: string,
        options: Partial<RegexCaptureOptions<Aliases, OptionalAliases, NamedGroups>> = {
            groups: this.groups,
            flags: this.flags,
            captureMode: 'none',
            strictMode: true
        }
    ): Array<RegexMatchesPerCaptureGroup<`${typeof options['strictMode'] extends true ? `${`before_`}${`${NamedGroups}`}` : `${NamedGroups}`}`>> {
        return Regex.capture(data, {
            flags: options.flags || this.flags,
            captureMode: options.captureMode || 'none',
            strictMode: options.strictMode || true
        }, options.groups || this.groups)
    }

    /**
     * Returns an array with all captures in a string.
     */
    private static capture<Aliases extends string, OptionalAliases extends string = never, NamedGroups extends string = never>(
        data: string,
        options: Omit<RegexCaptureOptions<Aliases, OptionalAliases, NamedGroups>, 'groups'>,
        groups: Record<NamedGroups, Regex<Aliases, OptionalAliases, NamedGroups>>,
    ): Array<RegexMatchesPerCaptureGroup<`${typeof options['strictMode'] extends true ? `${`before_`}${`${NamedGroups}`}` : `${NamedGroups}`}`>> {        
        let source = ''
        for (const groupName of Object.keys(groups)) {
            const group = (groups as any)[groupName]
            source += `(?<${new Regex(`${groupName}`).compile().source.replace(/(^\(|\)$)/g, '')}>${group.compile().source})`
        }
        const regex = new RegExp(source, 'g')
        const matches = data.matchAll(regex)
        let match = matches.next()
        const captures: Array<RegexMatchesPerCaptureGroup<any>> = []
        let index = 0
        while (match.value) {
            index = match.value.index || 0
            const capture: typeof captures[number] = {}
            for (const groupName of Object.keys(match.value.groups)) {
                const groupValue = match.value.groups[groupName]
                const length = groupValue.length
                index += length
                if ((groups as any)[groupName]._skip) {
                    continue
                }
                capture[groupName] = {
                    match: groupValue,
                    index,
                    length
                }
            }
            captures.push(capture)
            match = matches.next()
        }
        return captures
        // // Convert the groups and keep track of the group names
        // let copyGroups: typeof groups = {} as any
        // for (const group of Object.keys(groups)) {
        //     if (!options.strictMode) {
        //         (copyGroups as any)[`before_${group}`] = /([\S\s]*?)/;
        //     }
        //     (copyGroups as any)[group] = (groups as any)[group]
        // }
        
        // // Variables
        // let groupNames: Record<string, string> = Object.keys(groups).map((v) => ({[v]: v})).reduce<Record<string, string>>((x, y) => Object.assign(x, y), {})
        // let regexes: Regex = new Regex()
        // options.flags = [...((options.flags || 'g') as RegexFlags).split('')].map<RegexFlags>((v) => v.toLowerCase() as RegexFlags).filter((v, i, a) => a.indexOf(v) === i).join('') as RegexFlags
        // options.captureMode = options.captureMode || 'none' as any

        // // Create the regex
        // for(const group of Object.keys(copyGroups) as Array<keyof typeof copyGroups>) {
        //     const name = /^[0-9]+$/.test(group)
        //         ? null
        //         : group
        //     const index = /^[0-9]+$/.test(group)
        //         ? String(group)
        //         : null
        //     const groupValue = copyGroups[group]
        //     const optional = groupValue instanceof RegExp
        //         ? false
        //         : groupValue.optional
        //     const quantifier = groupValue instanceof RegExp
        //         ? null
        //         : groupValue.quantifier
        //     const groupSource = groupValue.compile(options.flags).source
        //     const parsedName = Regex.parseCaptureGroupName(name || `group_${index}`)
        //     groupNames[group] = parsedName
        //     if (name?.length || index?.length) {
        //         const prefix = `(`
        //         const content = `?<${parsedName}>${quantifier ? '(' : ''}${optional ? '(' : ''}${groupSource}`
        //         const suffix = `${quantifier ? `${quantifier})` : ''}${optional ? `)?` : ''})`
        //         const regex = new Regex(new RegExp(`${prefix}${content}${suffix}`))
        //         regexes.children.push(regex)
        //     }
        //     else {
        //         throw Error('Cannot assign group to regex: Invalid name or index...')
        //     }
        // }

        // // Convert the regexes to a single regex
        // let regex: string = regexes.compile().source

        // // Process the capture mode into the regex
        // if (options.captureMode !== 'none') {
        //     switch (options.captureMode) {
        //         case 'until-end': {
        //             regex += '$'
        //         }
        //         case 'from-begin': {
        //             regex = '^' + regex
        //         }
        //         case 'from-begin-until-end': {
        //             regex = `^${regex}$`
        //         }
        //     }
        // }

        // // Find the matches
        // const allMatches = data.matchAll(new RegExp(regex, options.flags))
        // let match = allMatches.next()

        // // // Process the matches
        // const returnGroups: any[] = []
        // let index = 0
        // while (match.value && match.value.groups) {
        //     const group: any = {}
        //     for (let i = 0; i < Object.keys(match.value.groups).length; i ++) {
        //         const groupName = Object.keys(match.value.groups)[i]
        //         const originalName = Object.keys(copyGroups)[i]
        //         if (!(copyGroups as any)[originalName]._skip) {
        //             group[originalName] = {
        //                 match: match.value.groups[groupName],
        //                 index: match.value.index + index,
        //                 length: match.value.groups[groupName].length || 0
        //             }
        //         }
        //         index += match.value.groups[groupName].length || 0
        //     }
        //     returnGroups.push(group)
        //     match = allMatches.next()
        // }
        // return returnGroups
    }

    /**
     * Parses a capture group name into a valid one
     * @param name the group name
     * @returns the parsed name
     */
    private static parseCaptureGroupName = (name: string): string => {
        return name
            .replace(/\\|\/|\^|\$|\.|\||\?|\*|\+|\(|\)|\[|\]|\{|\}|\-/g, '')
            .replace(/\s| |\t|\n|\r\n|\r/g, '_')
            .replace(/1/g, 'one')
            .replace(/2/g, 'two')
            .replace(/3/g, 'three')
            .replace(/4/g, 'four')
            .replace(/5/g, 'five')
            .replace(/6/g, 'six')
            .replace(/7/g, 'seven')
            .replace(/8/g, 'eight')
            .replace(/9/g, 'nine')
            .replace(/0/g, 'zero')
    }
    //#endregion

    //#region Creating groups and aliases
    /**
     * Adds a group to
     * @param name the name
     * @param regex the regex
    */
    public skip(callback: RegexCallback<Aliases, OptionalAliases, NamedGroups>): RegexGroupPick<Aliases, OptionalAliases, NamedGroups> {
        return this.group(`group_that_is_skipped_${Object.keys(this.groups).length + 1}` as any, callback, 'skip') as any
    }

    /**
     * Adds a named capture group.
     * @param name the name
     * @param regex the regex
     */
    public static group<T extends Exclude<string, ''>>(name: Exclude<T, ''>, callback: RegexCallback<'', '', T>): RegexGroupPick<never, never, T> {
        return new Regex<never, never, T>().group(name as any, callback as any, 'group') as any
    }
    
    /**
     * Adds an alias to the Regex builder.
     * 
     * @param name The name
     * @param regex The regex
     * @returns The instance
     */
    public group<T extends Exclude<string, ''|Aliases|OptionalAliases|NamedGroups>>(name: Exclude<T, ''|Aliases|OptionalAliases|NamedGroups>, callback: RegexCallback<Aliases, OptionalAliases, NamedGroups>, mode: 'group'|'skip' = 'group'): RegexGroupPick<Aliases, OptionalAliases, NamedGroups|T> {
        return this.alias(name, callback, mode) as any
    }

    /**
     * Adds an alias to the regex builder.
     * @param name the name
     * @param regex the regex
     */
    public static alias<T extends Exclude<string, ''>>(name: Exclude<T, ''>, callback: RegexCallback<'', ''>): RegexAliasPick<T, `${T}?` | `${T}+` | `${T}*` | `${T}*?` | `${T}+?`, never> {
        return new Regex<T, `${T}${`?`|'*'|`+`|`+?`}`>()
            .alias(name as any, callback as any)
    }

    /**
     * Adds an alias to the Regex builder.
     * 
     * @param name The name
     * @param regex The regex
     * @param hide this hides the alias from the list of aliases
     * @returns The instance
     */
    public alias<T extends Exclude<string, ''|Aliases|OptionalAliases|NamedGroups>>(name: Exclude<T, ''|Aliases|OptionalAliases|NamedGroups>, callback: RegexCallback<Aliases, OptionalAliases, NamedGroups>, mode: 'alias'|'group'|'skip' = 'alias'): RegexAliasPick<Aliases|T, OptionalAliases | `${T}?` | `${T}*` | `${T}*?` | `${T}+` | `${T}+?`, NamedGroups> {
        let regex: Regex<Aliases, OptionalAliases, NamedGroups> | null = null
        if (typeof callback === 'number' || typeof callback === 'boolean') {
           regex = Regex.parseVariable(callback)
        }
        else if (typeof callback === 'object') {
            regex = Regex.parseVariable(callback)
        }
        else if (typeof callback === 'string') {
            regex = (this.aliases as any)[callback.replace(/[+*?]+$/g, '')] || (this.groups as any)[callback.replace(/[+*?]+$/g, '')]
        }
        else if (callback instanceof Regex) {
            regex = callback
        }
        else if (callback instanceof RegExp) {
            regex = new Regex(RegExp)
        }
        else if (typeof callback === 'function') {
            if (callback.length === 0) {
                regex = Regex.parseVariable((callback as any)() as string)
            }
            else {
                regex = (callback as any)({
                    regex: (...args: Array<PickRegex<Aliases, OptionalAliases, NamedGroups> | RegExp | Aliases | OptionalAliases | NamedGroups | (() => string)>) => {
                        return this.callback(...args)
                    },
                    helpers: this.utils.helpers,
                    variable: (variable: string | number | boolean | (() => string) | {toString(): string}) => {
                        if (typeof variable === 'string') {
                            return this.callback(() => variable)
                        }
                        if (typeof variable === 'number') {
                            return this.callback(() => String(variable))
                        }
                        if (typeof variable === 'boolean') {
                            return this.callback(() => variable ? 'true' : 'false')
                        }
                        if (typeof variable === 'object') {
                            return this.callback(() => variable.toString())
                        }
                        return this.callback(variable)
                    }
                })
            }
        }
        if (mode === 'alias') {
            (this.aliases as any)[name] = regex!
        }
        else if (mode === 'group' || mode === 'skip') {
            if (mode === 'group') {
                (this.groups as any)[name] = regex!
            }
            if (mode === 'skip') {
                (this.groups as any)[name] = regex!;
                (this.groups as any)[name]._skip = true
            }
        }
        const setAliasesAndGroups = (parent: Regex<Aliases, OptionalAliases, NamedGroups>) => {
            parent.groups = this.groups
            parent.aliases = this.aliases
            for (const child of parent.children || []) {
                setAliasesAndGroups(child)
            }
        }
        setAliasesAndGroups(this)
        if (regex) {
            setAliasesAndGroups(regex)
        }
        else {
            throw new Error(`Error in code`)
        }
        return mode === 'alias'
            ? (this.aliases as Record<Aliases|OptionalAliases|NamedGroups|T, Regex<Aliases, OptionalAliases, NamedGroups>>)[name] as Regex<Aliases|T, OptionalAliases | `${T}?` | `${T}*` | `${T}*?` | `${T}+` | `${T}+?`, NamedGroups>
            :   mode === 'group'
                ? (this.groups as Record<Aliases|OptionalAliases|NamedGroups|T, Regex<Aliases, OptionalAliases, NamedGroups>>)[name] as Regex<Aliases, OptionalAliases, NamedGroups|T>
                : (this.groups as Record<Aliases|OptionalAliases|NamedGroups|T, Regex<Aliases, OptionalAliases, NamedGroups>>)[name] as Regex<Aliases, OptionalAliases, NamedGroups> as any
    }
    //#endregion

    //#region Converters
    /**
     * Compiles a regex based on the options.
     * 
     * @param callback the callback
     * @returns the instance
     */
    public static toRegExp = <Aliases extends string>(callback: number|boolean|{toString(): string}|(() => string)|RegExp|((options: {regex: (...args: Array<PickRegex<Aliases, never, never> | RegExp | (() => string)>) => Pick<Regex<Aliases>, RegexBuilderPropertiesNested>, helpers: RegexHelpers<Aliases>}) => Pick<Regex<Aliases>, RegexBuilderPropertiesNested>), flags?: UniqueCombinations<RegexFlags>): RegExp => {
        return new Regex<Aliases>().toRegExp(callback as any, flags)
    }

    /**
     * Generates a regex based on the options.
     * 
     * @param callback the callback
     * @returns the instance
     */
    public toRegExp = (callback: number|boolean|(() => string)|{toString(): string}|RegExp|Aliases|OptionalAliases|NamedGroups|(() => string)|((options: {regex: (...args: Array<PickRegex<Aliases, OptionalAliases, NamedGroups> | RegExp | Aliases | OptionalAliases | NamedGroups | (() => string)>) => Pick<Regex<Aliases, OptionalAliases, NamedGroups>, RegexBuilderPropertiesNested>, helpers: RegexHelpers<Aliases, OptionalAliases, NamedGroups>, variable: (variable: string|number|{toString(): string}) => (() => string)}) => Pick<Regex<Aliases, OptionalAliases, NamedGroups>, RegexBuilderPropertiesNested>), flags?: UniqueCombinations<RegexFlags>): RegExp => {
        if (callback instanceof RegExp) {
            return callback
        }
        else if (callback instanceof Regex) {
            return callback.compile()
        }
        else if (typeof callback === 'string') {
            const findAlias = (alias: Aliases|OptionalAliases|NamedGroups, options: {
                plusSign?: boolean
                _optional?: boolean
                allExcept?: boolean
                quantifierUnlimited?: boolean,
                unlimitedQuestionmark?: boolean
            } = {}): Regex<Aliases, OptionalAliases,NamedGroups>|null => {
                if ((this.groups as any)[alias]) {
                    const regex = new Regex((this.groups as any)[alias])
                    regex.groups = this.groups
                    regex.aliases = this.aliases
                    if (options.plusSign) {
                        regex.plusSign = true
                    }
                    if (options.unlimitedQuestionmark) {
                        regex.quantifierAsterix = true
                        regex.optional = true
                    }
                    if (options.quantifierUnlimited) {
                        regex.quantifierAsterix = true
                    }
                    if (options._optional) {
                        regex.optional = true
                    }
                    if (options.allExcept) {
                        regex.allExcept = true
                    }
                    return regex as any
                }
                else if ((this.aliases as any)[alias]) {
                    const regex = new Regex((this.aliases as any)[alias])
                    regex.groups = this.groups
                    regex.aliases = this.aliases
                    if (options.plusSign) {
                        regex.plusSign = true
                    }
                    if (options.unlimitedQuestionmark) {
                        regex.quantifierAsterix = true
                        regex.optional = true
                    }
                    if (options.quantifierUnlimited) {
                        regex.quantifierAsterix = true
                    }
                    if (options._optional) {
                        regex.optional = true
                    }
                    if (options.allExcept) {
                        regex.allExcept = true
                    }
                    return regex as any
                }
                else {
                    if (alias.endsWith('*?')) {
                        return findAlias(alias.substring(0, alias.length - 2) as Aliases|OptionalAliases|NamedGroups, {
                            ...options,
                            unlimitedQuestionmark: true
                        })
                    }
                    else if (alias.startsWith('[^') && alias.endsWith(']')) {
                        return findAlias(alias.substring(2, alias.length - 1) as Aliases|OptionalAliases|NamedGroups, {
                            ...options,
                            allExcept: true
                        })
                    }
                    else if (alias.endsWith('?')) {
                        return findAlias(alias.substring(0, alias.length - 1) as Aliases|OptionalAliases|NamedGroups, {
                            ...options,
                            _optional: true
                        })
                    }
                    else if (alias.endsWith('+')) {
                        return findAlias(alias.substring(0, alias.length - 1) as Aliases|OptionalAliases|NamedGroups, {
                            ...options,
                            plusSign: true
                        })
                    }
                    else if (alias.endsWith('*')) {
                        return findAlias(alias.substring(0, alias.length - 1) as Aliases|OptionalAliases|NamedGroups, {
                            ...options,
                            quantifierUnlimited: true
                        })
                    }
                    else {
                        return null
                    }
                }
            }
            const alias = findAlias(callback as any)
            if (!alias) {
                throw Error(`Could not find alias for regex: "${callback}"`)
            }
            return alias.compile(flags)
        }
        else if (typeof callback === 'function') {
            if (callback.length === 0) {
                return Regex.parseVariable((callback as Function)() as string).compile(flags)
            }
            else {
                return (
                    (
                        callback({
                            regex: (...args: Array<PickRegex<Aliases, OptionalAliases,NamedGroups> | RegExp | Aliases | OptionalAliases | NamedGroups | (() => string)>) => {
                                return this.callback(...args)
                            },
                            helpers: this.utils.helpers,
                            variable: (variable: string | number | boolean | (() => string) | {toString(): string}) => {
                                if (typeof variable === 'string') {
                                    return () => variable
                                }
                                if (typeof variable === 'number') {
                                    return () => String(variable)
                                }
                                if (typeof variable === 'boolean') {
                                    return () => variable ? 'true' : 'false'
                                }
                                if (typeof variable === 'object') {
                                    return () => variable.toString()
                                }
                                return variable
                            }
                        })
                    )
                ).compile(flags)
            }
        }
        else if (typeof callback === 'number') {
            return this.toRegExp(() => String(callback))
        }
        else if (typeof callback === 'boolean') {
            return this.toRegExp(() => callback ? 'true' : 'false')
        }
        else if (typeof callback === 'object') {
            return this.toRegExp(() => String(callback.toString()))
        }
        else {
            throw Error(`Invalid object given in Regex.compile: "${callback}"`)
        }
    }

    /**
     * Compiles a regex based on the options.
     * 
     * @param callback the callback
     * @returns the instance
     */
    public static toSource = <Aliases extends string>(callback: number|boolean|{toString(): string}|(() => string)|RegExp|((options: {regex: (...args: Array<PickRegex<Aliases, ""> | RegExp | (() => string)>) => Pick<Regex<Aliases>, RegexBuilderPropertiesNested>, helpers: RegexHelpers<Aliases>}) => Pick<Regex<Aliases>, RegexBuilderPropertiesNested>), flags?: UniqueCombinations<RegexFlags>): string => {
        return Regex.toRegExp(callback, flags).source
    }

    /**
     * Generates a regex based on the options.
     * 
     * @param callback the callback
     * @returns the instance
     */
    public toSource = (callback: RegExp|Aliases|OptionalAliases|NamedGroups|(() => string)|{toString():string}|boolean|number|((options: {regex: (...args: Array<PickRegex<Aliases, OptionalAliases, NamedGroups> | RegExp | Aliases | OptionalAliases | NamedGroups | (() => string)>) => Pick<Regex<Aliases, OptionalAliases, NamedGroups>, RegexBuilderPropertiesNested>, helpers: RegexHelpers<Aliases, OptionalAliases, NamedGroups>, variable: (variable: string|number|{toString(): string}) => (() => string)}) => Pick<Regex<Aliases, OptionalAliases, NamedGroups>, RegexBuilderPropertiesNested>), flags?: UniqueCombinations<RegexFlags>): string => {
        return this.toRegExp(callback, flags).source
    }
    //#endregion

    //#region Utils
    /**
     * Parses a variable into a Regex instance.
     * @param variable the variable
     * @returns the Regex instance
     */
    private static parseVariable = <Aliases extends string = never, OptionalAliases extends string = never, NamedGroups extends string = never>(variable: RegExp|Regex<any,any,any>|string|number|boolean|{toString(): string}): Regex<Aliases, OptionalAliases, NamedGroups> => {
        let temporaryValue = 'x'
        if (variable instanceof RegExp) {
            return new Regex<Aliases, OptionalAliases, NamedGroups>(variable)
        }
        else if (variable instanceof Regex) {
            return new Regex<Aliases, OptionalAliases, NamedGroups>(variable)
        }
        const newVariable =
            typeof variable === 'number'
                ? String(variable)
                : typeof variable === 'boolean'
                    ? variable
                        ? 'true'
                        : 'false'
                    : typeof variable === 'object'
                        ? variable.toString()
                        : variable
        while (newVariable.includes(temporaryValue)) {
            temporaryValue += 'x'
        }
        return new Regex<Aliases, OptionalAliases, NamedGroups>(new RegExp(
            newVariable
                .replace(/\\\\/g, temporaryValue)
                .replace(/\\/g, '\\\\')
                .replace(/\//g, '\\\/')
                .replace(/\^/g, '\\^')
                .replace(/\$/g, '\\$')
                .replace(/\./g, '\\.')
                .replace(/\|/g, '\\|')
                .replace(/\?/g, '\\?')
                .replace(/\*/g, '\\*')
                .replace(/\+/g, '\\+')
                .replace(/\(/g, '\\(')
                .replace(/\)/g, '\\)')
                .replace(/\[/g, '\\[')
                .replace(/\]/g, '\\]')
                .replace(/\{/g, '\\{')
                .replace(/\}/g, '\\}')
                .replace(/\-/g, '\\-')
                .replace(new RegExp(temporaryValue, 'g'), '\\\\')
        ))
    }

    /**
     * Generates the children for the helper functions.
     */
    private generateChildren = (...args: Array<{ until: RegExp|null }|{ behindUntil: RegExp|null }|Aliases|OptionalAliases|NamedGroups|RegexHelpers<Aliases, OptionalAliases>|PickRegex<Aliases, OptionalAliases>|PickRegex<Aliases, OptionalAliases>|RegExp|{toString(): string}|number|boolean|(() => string)>): Regex<Aliases, OptionalAliases, NamedGroups> => {
        const children: Regex<Aliases, OptionalAliases, NamedGroups>[] = []
        for (let i = 0; i < args.length; i ++) {
            const arg = args[i]
            if (typeof arg === 'object' && !(arg instanceof Regex || arg instanceof RegExp)) {
                const until: RegExp|null = (arg as any).until
                const behindUntil: RegExp|null = (arg as any).behindUntil

                if (until !== undefined) {
                    if (until) {
                        children.push(new Regex(until))
                    }
                    else {
                        if (i < args.length - 1) {
                            const ahead: Regex<Aliases, OptionalAliases, NamedGroups> = this.generateChildren(
                                ...args.filter((v, j) => j > i)
                            )
                            let source = ahead.compile().source
                            if (
                                (source.length >= 2 && ['?:', '?!', '?=', '?<'].includes(source.substring(0, 2)))
                                || (source.length >= 3 && ['?<!', '?<='].includes(source.substring(0, 3)))
                            ) {
                                source = `(${source})`
                            }
                            children.push(new Regex(new RegExp(`.*?(?=${source}{{{{{regex_until_end_123456789}}}}})`)))
                        }
                    }
                }
                else if (behindUntil !== undefined) {
                    if (behindUntil) {
                        children.push(new Regex(behindUntil))
                    }
                    else {
                        if (i < args.length - 1) {
                            const ahead: Regex<Aliases, OptionalAliases> = this.generateChildren(
                                ...args.filter((v, j) => j > i)
                            )
                            let source = ahead.compile().source
                            if (
                                (source.length >= 2 && ['?:', '?!', '?=', '?<'].includes(source.substring(0, 2)))
                                || (source.length >= 3 && ['?<!', '?<='].includes(source.substring(0, 3)))
                            ) {
                                source = `(${source})`
                            }
                            children.push(new Regex(new RegExp(`(?<=.*?(?=${source}{{{{{regex_until_end_123456789}}}}}))`)))
                        }
                    }
                }
            }
            else if (typeof arg === 'string') {
                if (arg === 'begin') {
                    children.push(new Regex(/^/))
                }
                else if (arg === 'end') {
                    children.push(new Regex(/$/))
                }
                else if ((this.aliases as any)[arg]) {
                    children.push((this.aliases as any)[arg])
                }
                else if ((this.groups as any)[arg]) {
                    children.push((this.groups as any)[arg])
                }
                else if (arg.endsWith('?')) {
                    if (arg.endsWith('*?')) {
                        const child = new Regex<Aliases, OptionalAliases, NamedGroups>((this.aliases as any)[arg.replace(/\*\?$/g, '')] || (this.groups as any)[arg.replace(/\*\?$/g, '')])
                        child.aliases = this.aliases
                        child.groups = this.groups
                        child.quantifierAsterix = true
                        child.optional = true
                        children.push(child)
                    }
                    else if (arg.endsWith('+?')) {
                        const child = new Regex<Aliases, OptionalAliases, NamedGroups>((this.aliases as any)[arg.replace(/\+\?$/g, '')] || (this.groups as any)[arg.replace(/\+\?$/g, '')])
                        child.aliases = this.aliases
                        child.groups = this.groups
                        child.plusSign = true
                        child.optional = true
                        children.push(child)
                    }
                    else {
                        const child = new Regex<Aliases, OptionalAliases, NamedGroups>((this.aliases as any)[arg.replace(/\?$/g, '')] || (this.groups as any)[arg.replace(/\?$/g, '')])
                        child.aliases = this.aliases
                        child.groups = this.groups
                        child.optional = true
                        children.push(child)
                    }
                }
                else if (arg.endsWith('+')) {
                    const child = new Regex<Aliases, OptionalAliases, NamedGroups>((this.aliases as any)[arg.replace(/\+$/g, '')] || (this.groups as any)[arg.replace(/\+$/g, '')])
                    child.aliases = this.aliases
                    child.groups = this.groups
                    child.plusSign = true
                    children.push(child)
                }
                else if (arg.endsWith('*')) {
                    const child = new Regex<Aliases, OptionalAliases, NamedGroups>((this.aliases as any)[arg.replace(/\*$/g, '')] || (this.groups as any)[arg.replace(/\*$/g, '')])
                    child.aliases = this.aliases
                    child.groups = this.groups
                    child.quantifierAsterix = true
                    children.push(child)
                }
            }
            else if (typeof arg === 'function') {
                children.push(Regex.parseVariable<Aliases, OptionalAliases, NamedGroups>((arg as Function)() as string) as any)
            }
            else if (arg instanceof RegExp) {
                children.push(new Regex<Aliases, OptionalAliases, NamedGroups>(arg))
            }
            else if (arg instanceof Regex) {
                children.push(arg)
            }
            else if (typeof arg === 'number') {
                children.push(new Regex(String(arg)))
            }
            else if (typeof arg === 'boolean') {
                children.push(new Regex(arg ? 'true' : 'false'))
            }
            else if (typeof arg === 'object' && arg['toString']) {
                children.push(new Regex((arg as any).toString()))
            }
        }
        return new Regex<Aliases, OptionalAliases, NamedGroups>(...children)
    }

    /**
     * Compiles the regex, automatically adds the global flag
     * 
     * @returns The regex
     */
    private compile = (flags?: string, level: number = 0): RegExp => {
        flags = flags ? flags.includes('g') ? flags : `g${flags}` : 'g'
        let regex = this.regex
            ? this.regex.source
            : this.children.map((child) => {
                const source = child.compile(flags, level + 1).source
                if (source.startsWith('(')) {
                    return source
                }
                return `(${source})`
            }).join('')
        if (!this.regex) {
            if (this.orStatements.length) {
                regex = `((${regex})|${this.orStatements.map((v) => `(${v.compile(flags, level + 1).source})`).join('|')})`
            }
        }
        if (this.plusSign) {
            regex = `(${regex})+`
        }
        if (this.quantifierAsterix && this.optional) {
            regex = `(${regex})*?`
        }
        else {
            if (this.quantifierAsterix) {
                regex = `(${regex})*`
            }
        }
        if (this.quantifier) {
            regex = `(${regex})${this.quantifier}`
        }
        if (this.allExcept) {
            regex = `[^${regex}]`
        }
        if (this.optional && !this.quantifierAsterix) {
            regex = `(${regex})?`
        }
        if (level === 0) {
            regex = regex.replace(/{{{{{regex_until_end_123456789}}}}}(?=([^{{{{{regex_until_end_123456789}}}}}]+)?$)/, '$')
            regex = regex.replace(/{{{{{regex_until_end_123456789}}}}}/, '')
        }
        return new RegExp(regex, flags || this.getFlags())
    }

    /**
     * Callback, but it returns a RegExp instance.
     * @param args The arguments
     * @returns The regexp instance
     */
    public callbackRegExp(...args: Array<Regex<Aliases, OptionalAliases, NamedGroups> | number | boolean | {toString(): string} | RegExp | Aliases | OptionalAliases | NamedGroups | (() => string)>): RegExp {
        return (this.callback(...args) as Regex<Aliases, OptionalAliases, NamedGroups>).compile()
    }

    /**
     * The callback within `Regex.compile()` and `Regex.alias()`.
     * @param args The args
     * @returns The callback
     */
    public callback(...args: Array<{ until: RegExp|null }|{ behindUntil: RegExp|null }|Regex<Aliases, OptionalAliases, NamedGroups> | RegExp | Aliases | OptionalAliases | NamedGroups | (() => string) | {toString(): string} | number | boolean>): Pick<Regex<Aliases, OptionalAliases, NamedGroups>, RegexBuilderPropertiesNested> {
        const children: Array<Regex<Aliases, OptionalAliases, NamedGroups>> = []
        for (let i = 0; i < args.length; i ++) {
            const arg = args[i]
            if (typeof arg === 'object' && !(arg instanceof Regex || arg instanceof RegExp)) {
                const until: RegExp|null = (arg as any).until
                const behindUntil: RegExp|null = (arg as any).behindUntil

                if (until !== undefined) {
                    if (until) {
                        children.push(new Regex(until))
                    }
                    else {
                        if (i < args.length - 1) {
                            const ahead: Regex<Aliases, OptionalAliases, NamedGroups> = this.generateChildren(
                                ...args.filter((v, j) => j > i)
                            )
                            let source = ahead.compile().source
                            if (
                                (source.length >= 2 && ['?:', '?!', '?=', '?<'].includes(source.substring(0, 2)))
                                || (source.length >= 3 && ['?<!', '?<='].includes(source.substring(0, 3)))
                            ) {
                                source = `(${source})`
                            }
                            children.push(new Regex(new RegExp(`.*?(?=${source}{{{{{regex_until_end_123456789}}}}})`)))
                        }
                    }
                }
                else if (behindUntil !== undefined) {
                    if (behindUntil) {
                        children.push(new Regex(behindUntil))
                    }
                    else {
                        if (i < args.length - 1) {
                            const ahead: Regex<Aliases, OptionalAliases> = this.generateChildren(
                                ...args.filter((v, j) => j > i)
                            )
                            let source = ahead.compile().source
                            if (
                                (source.length >= 2 && ['?:', '?!', '?=', '?<'].includes(source.substring(0, 2)))
                                || (source.length >= 3 && ['?<!', '?<='].includes(source.substring(0, 3)))
                            ) {
                                source = `(${source})`
                            }
                            children.push(new Regex(new RegExp(`(?<=.*?(?=${source}{{{{{regex_until_end_123456789}}}}}))`)))
                        }
                    }
                }
            }
            else if (typeof arg === 'string') {
                if ((this.aliases as any)[arg]) {
                    children.push((this.aliases as any)[arg])
                }
                else if ((this.groups as any)[arg]) {
                    children.push((this.groups as any)[arg])
                }
                else if (arg.endsWith('?')) {
                    let alias = this.aliases[arg.substring(0, arg.length - (arg.match(/(\+|\*)\?+$/g) ? 2 : 1)) as Aliases|OptionalAliases]
                    let copy = new Regex<Aliases, OptionalAliases, NamedGroups>()
                    copy.groups = Object.assign({}, alias.groups)
                    copy.aliases = Object.assign({}, alias.aliases)
                    copy.children = alias.children
                    copy.optional = true
                    if (arg.endsWith('+?')) {
                        copy.plusSign = true
                    }
                    if (arg.endsWith('*?')) {
                        copy.quantifierAsterix = true
                    }
                    copy.regex = alias.regex
                    children.push(copy)
                    
                }
                else if (arg.endsWith('+')) {
                    let alias = this.aliases[arg.substring(0, arg.length - 1) as Aliases|OptionalAliases]
                    let copy = new Regex<Aliases, OptionalAliases, NamedGroups>()
                    copy.groups = Object.assign({}, alias.groups)
                    copy.children = alias.children
                    copy.plusSign = true
                    copy.regex = alias.regex
                    children.push(copy)
                }
                else if (arg.endsWith('*')) {
                    let alias = this.aliases[arg.substring(0, arg.length - 1) as Aliases|OptionalAliases]
                    let copy = new Regex<Aliases, OptionalAliases, NamedGroups>()
                    copy.groups = Object.assign({}, alias.groups)
                    copy.children = alias.children
                    copy.quantifierAsterix = true
                    copy.regex = alias.regex
                    children.push(copy)
                }
                else if (arg.startsWith('[^') && arg.endsWith(']')) {
                    let alias = this.aliases[arg.substring(2, arg.length - 1) as Aliases|OptionalAliases]
                    let copy = new Regex<Aliases, OptionalAliases, NamedGroups>()
                    copy.groups = Object.assign({}, alias.groups)
                    copy.children = alias.children
                    copy.allExcept = true
                    copy.regex = alias.regex
                    children.push(copy)
                }
            }
            else if (arg instanceof RegExp) {
                children.push(new Regex(arg))
            }
            else if (arg instanceof Regex) {
                children.push(arg)
            }
            else if (typeof arg === 'function') {
                children.push(Regex.parseVariable<Aliases, OptionalAliases, NamedGroups>((arg as Function)() as string) as any)
            }
        }
        const regex = new Regex(...children)
        regex.groups = this.groups
        regex.aliases = this.aliases
        const setAliasesAndGroups = (regex: Regex<Aliases, OptionalAliases, NamedGroups>) => {
            for (const child of regex.children) {
                child.groups = regex.groups
                child.aliases = regex.aliases
                setAliasesAndGroups(child)
            }
        }
        setAliasesAndGroups(regex)
        return regex
    }
    //#endregion

    //#region Operators
    /**
     * Combines the regex with this or statement
     * 
     * @param args the arguments to build a new `Regex` instance
     */
    public or(...args: Array<number | boolean | {toString(): string} | RegExp | PickRegex<Aliases, OptionalAliases, NamedGroups> | Aliases | OptionalAliases | NamedGroups | (() => string)>): Pick<Regex<Aliases, OptionalAliases>, RegexBuilderPropertiesNested> {
        if (args.length) {
            const regex = this.callback(...args)
            this.orStatements.push(regex as Regex<Aliases, OptionalAliases, NamedGroups>)
        }
        return this
    }
    //#endregion

    //#region Modifiers
    /**
     * Set the flags
     * 
     * @param flags the flags
     */
    public setFlags = (flags: UniqueCombinations<RegexFlags>): Pick<Regex<Aliases, OptionalAliases, NamedGroups>, RegexBuilderPropertiesAfterFlags> => {
        this.flags = flags
        return this as never
    }

    /**
     * Sets the quantifier for the regex
     * 
     * @param quantifier The quantifier
     */
    public setQuantifier(quantifier: string | RegExp): Pick<Regex<Aliases, OptionalAliases, NamedGroups>, RegexBuilderPropertiesNestedAfterQuantifier> {
        this.quantifier = quantifier instanceof RegExp
            ? quantifier.source
            : quantifier
        return this
    }

    /**
     * Makes a regex optional
     * @param optional whether or not this regex instance should be optional
     */
    public setOptional(optional: boolean = true): Pick<Regex<Aliases, OptionalAliases, NamedGroups>, RegexBuilderPropertiesNested> {
        this.optional = optional
        return this
    }
    //#endregion

    //#region Helper functions
    /**
     * Creates groups of every argument with a name.
     * @returns the statement
     */
    public captureGroups(...args: Array<{ until: RegExp|null }|{ behindUntil: RegExp|null }|Aliases|OptionalAliases|NamedGroups|number|boolean|{toString(): string}|RegexHelpers<Aliases, OptionalAliases>|PickRegex<Aliases, OptionalAliases>|PickRegex<Aliases, OptionalAliases>|RegExp|(() => string)>): RegExp {
        let regex = new Regex()
        for (let i = 0; i < args.length; i ++) {
            const arg = args[i]
            let child = this.generateChildren(arg)
            let source = child.compile().source
            if (typeof arg === 'object' && !(arg instanceof Regex || arg instanceof RegExp)) {
                child = this.generateChildren(arg, ...args.filter((v, j) => j > i)).children[0]
                source = child.compile().source
            }
            if (source.startsWith('(') && source.endsWith(')')) {
                let endParenIndex: number|null = null
                let level = 0
                for (let i = 0; i < source.length; i ++) {
                    const char = source[i]
                    if (char === '(') {
                        level ++                }
                    else if (char === ')') {
                        level --
                        if (level === 0) {
                            if (i === source.length - 1) {
                                endParenIndex = i
                            }
                            break
                        }
                    }
                }
                if (endParenIndex !== null) {
                    source = source.substring(1, source.length - 1)
                }
            }
            if (
                (source.length >= 2 && ['?:', '?!', '?=', '?<'].includes(source.substring(0, 2)))
                || (source.length >= 3 && ['?<!', '?<='].includes(source.substring(0, 3)))
            ) {
                regex.children.push(new Regex(new RegExp(`(${source})`)))
            }
            else if (source.startsWith('.*?')) {
                regex.children.push(new Regex(new RegExp(`(${source})`)))
            }
            else {
                regex.children.push(new Regex(new RegExp(`(?<group_${i + 1}>${source})`)))
            }
        }

        let source = regex.compile().source

        if (source.startsWith('(') && source.endsWith(')')) {
            let endParenIndex: number|null = null
            let level = 0
            for (let i = 0; i < source.length; i ++) {
                const char = source[i]
                if (char === '(') {
                    level ++                }
                else if (char === ')') {
                    level --
                    if (level === 0) {
                        if (i === source.length - 1) {
                            endParenIndex = i
                        }
                        break
                    }
                }
            }
            if (endParenIndex !== null) {
                source = source.substring(1, source.length - 1)
            }
        }
        if (
            (source.length >= 2 && ['?:', '?!', '?=', '?<'].includes(source.substring(0, 2)))
            || (source.length >= 3 && ['?<!', '?<='].includes(source.substring(0, 3)))
        ) {
            source = `(${source})`
        }
        return new RegExp(source)
    }
    /**
     * A lookahead statement
     * @returns the statement
     */
    public lookahead(...args: Array<{ until: RegExp|null }|{ behindUntil: RegExp|null }|Aliases|OptionalAliases|NamedGroups|RegexHelpers<Aliases, OptionalAliases>|PickRegex<Aliases, OptionalAliases, NamedGroups>|PickRegex<Aliases, OptionalAliases, NamedGroups>|RegExp|(() => string)>): RegExp {
        const regex = this.generateChildren(...args)
        let source = regex.compile().source

        if (source.startsWith('(') && source.endsWith(')')) {            
            let endParenIndex: number|null = null
            let level = 0
            for (let i = 0; i < source.length; i ++) {
                const char = source[i]
                if (char === '(') {
                    level ++
                }
                else if (char === ')') {
                    level --
                    if (level === 0) {
                        if (i === source.length - 1) {
                            endParenIndex = i
                        }
                        break
                    }
                }
            }
            if (endParenIndex !== null) {
                source = source.substring(1, source.length - 1)
            }
        }
        return new RegExp(`(?=${source})`)
    }

    /**
     * A lookbehind statement
     * @returns the statement
     */
    public lookbehind(...args: Array<{ until: RegExp|null }|{ behindUntil: RegExp|null }|Aliases|OptionalAliases|NamedGroups|RegexHelpers<Aliases, OptionalAliases>|PickRegex<Aliases, OptionalAliases, NamedGroups>|PickRegex<Aliases, OptionalAliases, NamedGroups>|RegExp|(() => string)>): RegExp {
        const regex = this.generateChildren(...args)
        let source = regex.compile().source

        if (source.startsWith('(') && source.endsWith(')')) {
            let endParenIndex: number|null = null
            let level = 0            
            for (let i = 0; i < source.length; i ++) {
                const char = source[i]
                if (char === '(') {
                    level ++
                }
                else if (char === ')') {
                    level --
                    if (level === 0) {
                        if (i === source.length - 1) {
                            endParenIndex = i
                        }
                        break
                    }
                }
            }
            if (endParenIndex !== null) {
                source = source.substring(1, source.length - 1)
            }
        }
        return new RegExp(`(?<=${source})`)
    }

    /**
     * A negative lookahead statement
     * @returns the statement
     */
    public negativeLookahead(...args: Array<{ until: RegExp|null }|{ behindUntil: RegExp|null }|Aliases|OptionalAliases|NamedGroups|RegexHelpers<Aliases, OptionalAliases, NamedGroups>|PickRegex<Aliases, OptionalAliases, NamedGroups>|PickRegex<Aliases, OptionalAliases, NamedGroups>|RegExp|(() => string)>): RegExp {
        const regex = this.generateChildren(...args)
        let source = regex.compile().source

        if (source.startsWith('(') && source.endsWith(')')) {
            let endParenIndex: number|null = null
            let level = 0
            for (let i = 0; i < source.length; i ++) {
                const char = source[i]                
                if (char === '(') {
                    level ++
                }
                else if (char === ')') {
                    level --
                    if (level === 0) {
                        if (i === source.length - 1) {
                            endParenIndex = i
                        }
                        break
                    }
                }
            }
            if (endParenIndex !== null) {
                source = source.substring(1, source.length - 1)
            }
        }
        return new RegExp(`(?!${source})`)
    }

    /**
     * A negative lookbehind statement
     * @returns the statement
     */
    public negativeLookbehind(...args: Array<{ until: RegExp|null }|{ behindUntil: RegExp|null }|Aliases|OptionalAliases|NamedGroups|RegexHelpers<Aliases, OptionalAliases, NamedGroups>|PickRegex<Aliases, OptionalAliases, NamedGroups>|PickRegex<Aliases, OptionalAliases, NamedGroups>|RegExp|(() => string)>): RegExp {
        const regex = this.generateChildren(...args)
        let source = regex.compile().source

        if (source.startsWith('(') && source.endsWith(')')) {
            let endParenIndex: number|null = null
            let level = 0
            for (let i = 0; i < source.length; i ++) {
                const char = source[i]
                if (char === '(') {
                    level ++                }
                else if (char === ')') {
                    level --
                    if (level === 0) {
                        if (i === source.length - 1) {
                            endParenIndex = i
                        }
                        break
                    }
                }
            }
            if (endParenIndex !== null) {
                source = source.substring(1, source.length - 1)
            }
        }
        return new RegExp(`(?<!${source})`)
    }
    //#endregion
}