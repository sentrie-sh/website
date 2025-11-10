// Sentrie language grammar definition for syntax highlighting
// Based on the official EBNF and PEG grammar definitions
export const sentrieGrammar = {
  name: 'sentrie',
  scopeName: 'source.sentrie',
  patterns: [
    // Comments
    {
      name: 'comment.line.sentrie',
      match: /^--.*$/gm
    },

    // Keywords - Program Structure
    {
      name: 'keyword.control.sentrie',
      match: /\b(namespace|policy|rule|fact|let|export|import|use|from|as|default|when|yield|shape|attach|decision|of|with)\b/
    },

    // Keywords - Higher-order operations
    {
      name: 'keyword.control.higher-order.sentrie',
      match: /\b(any|all|filter|map|distinct|reduce|cast|count)\b/
    },

    // Keywords - Boolean operators
    {
      name: 'keyword.operator.boolean.sentrie',
      match: /\b(and|or|xor|not)\b/
    },

    // Keywords - Comparison operators
    {
      name: 'keyword.operator.comparison.sentrie',
      match: /\b(is|in|contains|matches|defined|empty)\b/
    },

    // Keywords - State checking
    {
      name: 'keyword.operator.state.sentrie',
      match: /\b(not\s+in|not\s+contains|not\s+matches|not\s+defined|not\s+empty)\b/
    },

    // Literals - Trinary values
    {
      name: 'constant.language.trinary.sentrie',
      match: /\b(true|false|unknown)\b/
    },

    // Literals - Null
    {
      name: 'constant.language.null.sentrie',
      match: /\bnull\b/
    },

    // Types - Primitive types
    {
      name: 'storage.type.primitive.sentrie',
      match: /\b(int|float|string|bool|document)\b/
    },

    // Types - Collection types
    {
      name: 'storage.type.collection.sentrie',
      match: /\b(list|map|record)\b/
    },

    // Strings - Double quoted
    {
      name: 'string.quoted.double.sentrie',
      begin: /"/,
      end: /"/,
      patterns: [
        {
          name: 'constant.character.escape.sentrie',
          match: /\\./
        }
      ]
    },

    // Numbers - Integers
    {
      name: 'constant.numeric.integer.sentrie',
      match: /\b\d+\b/
    },

    // Numbers - Floats
    {
      name: 'constant.numeric.float.sentrie',
      match: /\b\d+\.\d+\b/
    },

    // Operators - Comparison
    {
      name: 'operator.comparison.sentrie',
      match: /(==|!=|<=|>=|<|>)/
    },

    // Operators - Arithmetic
    {
      name: 'operator.arithmetic.sentrie',
      match: /(\+|\-|\*|\/|%)/
    },

    // Operators - Logical
    {
      name: 'operator.logical.sentrie',
      match: /(\?|:)/
    },

    // Operators - Unary
    {
      name: 'operator.unary.sentrie',
      match: /(!)/
    },

    // Punctuation - Separators
    {
      name: 'punctuation.separator.sentrie',
      match: /[,;:]/
    },

    // Punctuation - Brackets and braces
    {
      name: 'punctuation.definition.sentrie',
      match: /[{}[\]()]/
    },

    // Punctuation - Accessor
    {
      name: 'punctuation.accessor.sentrie',
      match: /\./
    },

    // Punctuation - Required/Optional markers
    {
      name: 'punctuation.markup.sentrie',
      match: /[!?]/
    },

    // Type constraints
    {
      name: 'entity.name.tag.constraint.sentrie',
      match: /@[a-zA-Z_][a-zA-Z0-9_]*/
    },

    // Identifiers - Type names (PascalCase)
    {
      name: 'entity.name.type.sentrie',
      match: /\b[A-Z][a-zA-Z0-9_]*\b/
    },

    // Identifiers - Variables and functions (camelCase/snake_case)
    {
      name: 'variable.other.sentrie',
      match: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/
    },

    // FQN (Fully Qualified Names) - namespace paths
    {
      name: 'entity.name.namespace.sentrie',
      match: /\b[a-zA-Z_][a-zA-Z0-9_]*(?:\/[a-zA-Z_][a-zA-Z0-9_]*)+/
    }
  ]
}
