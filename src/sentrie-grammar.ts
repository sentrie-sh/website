// Sentrie language grammar definition for syntax highlighting
// Based on the official EBNF and PEG grammar definitions
export const sentrieGrammar = {
  name: 'sentrie',
  scopeName: 'source.sentrie',
  patterns: [
    // Comments
    {
      name: 'comment.line.sentrie',
      match: String.raw`--.*$`
    },

    // Keywords - Program Structure
    {
      name: 'keyword.control.sentrie',
      match: String.raw`\b(namespace|policy|rule|fact|let|export|import|use|from|as|default|when|yield|shape|attach|decision|of|with|contribute)\b`
    },

    // Keywords - State checking
    {
      name: 'keyword.operator.state.sentrie',
      match: String.raw`\b(not\s+in|not\s+contains|not\s+matches|not\s+defined|not\s+empty)\b`
    },

    // Keywords - Boolean operators
    {
      name: 'keyword.operator.boolean.sentrie',
      match: String.raw`\b(and|or|xor|not)\b`
    },

    // Keywords - Comparison operators
    {
      name: 'keyword.operator.comparison.sentrie',
      match: String.raw`\b(is|in|contains|matches|defined|empty)\b`
    },

    // Literals - Trinary values
    {
      name: 'constant.language.trinary.sentrie',
      match: String.raw`\b(true|false|unknown)\b`
    },

    // Literals - Null
    {
      name: 'constant.language.null.sentrie',
      match: String.raw`\bnull\b`
    },

    // Types - Primitive types
    {
      name: 'storage.type.primitive.sentrie',
      match: String.raw`\b(int|float|string|bool|document)\b`
    },

    // Types - Collection types
    {
      name: 'storage.type.collection.sentrie',
      match: String.raw`\b(list|dict|record)\b`
    },

    // Strings - Double quoted
    {
      name: 'string.quoted.double.sentrie',
      begin: String.raw`"`,
      end: String.raw`"`,
      patterns: [
        {
          name: 'constant.character.escape.sentrie',
          match: String.raw`\\.`
        }
      ]
    },

    // Numbers - Floats
    {
      name: 'constant.numeric.float.sentrie',
      match: String.raw`\b\d+\.\d+\b`
    },

    // Numbers - Integers
    {
      name: 'constant.numeric.integer.sentrie',
      match: String.raw`\b\d+\b`
    },

    // Operators - Lambda arrow
    {
      name: 'keyword.operator.lambda.sentrie',
      match: String.raw`=>`
    },

    // Operators - Comparison
    {
      name: 'operator.comparison.sentrie',
      match: String.raw`(==|!=|<=|>=|<|>)`
    },

    // Operators - Arithmetic
    {
      name: 'operator.arithmetic.sentrie',
      match: String.raw`(\+|\-|\*|\/|%)`
    },

    // Operators - Logical
    {
      name: 'operator.logical.sentrie',
      match: String.raw`(\?|:)`
    },

    // Operators - Unary
    {
      name: 'operator.unary.sentrie',
      match: String.raw`(!)`
    },

    // Punctuation - Separators
    {
      name: 'punctuation.separator.sentrie',
      match: String.raw`[,;:]`
    },

    // Punctuation - Brackets and braces
    {
      name: 'punctuation.definition.sentrie',
      match: String.raw`[{}\[\]()]`
    },

    // Punctuation - Accessor
    {
      name: 'punctuation.accessor.sentrie',
      match: String.raw`\.`
    },

    // Punctuation - Required/Optional markers
    {
      name: 'punctuation.markup.sentrie',
      match: String.raw`[!?]`
    },

    // Type constraints
    {
      name: 'entity.name.tag.constraint.sentrie',
      match: String.raw`@[a-zA-Z_][a-zA-Z0-9_]*`
    },

    // FQN (Fully Qualified Names) - namespace paths
    {
      name: 'entity.name.namespace.sentrie',
      match: String.raw`\b[a-zA-Z_][a-zA-Z0-9_]*(?:\/[a-zA-Z_][a-zA-Z0-9_]*)+`
    },

    // Function calls
    {
      name: 'entity.name.function.sentrie',
      match: String.raw`\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()`
    },

    // Identifiers - Type names (PascalCase)
    {
      name: 'entity.name.type.sentrie',
      match: String.raw`\b[A-Z][a-zA-Z0-9_]*\b`
    },

    // Identifiers - Variables and functions (camelCase/snake_case)
    {
      name: 'variable.other.sentrie',
      match: String.raw`\b[a-zA-Z_][a-zA-Z0-9_]*\b`
    }
  ]
}
