import { findAll, type FindAllArgs } from 'highlight-words-core';
import { styled, Text, type TextProps } from 'tamagui';

const Highlight = styled(Text, {
  backgroundColor: '$yellow5',
});

interface HighlightTextProps extends FindAllArgs, TextProps {
  highlightStyle?: TextProps['style'];
}

export function HighlightedText({
  autoEscape,
  caseSensitive,
  sanitize,
  searchWords,
  textToHighlight,
  highlightStyle,
  ...props
}: HighlightTextProps) {
  const chunks = findAll({
    autoEscape,
    caseSensitive,
    sanitize,
    searchWords,
    textToHighlight,
  });

  return (
    <Text {...props}>
      {chunks.map((chunk, index) => {
        const text = textToHighlight.substr(
          chunk.start,
          chunk.end - chunk.start,
        );

        return chunk.highlight ? (
          <Highlight key={`chunk-${index}`} {...props} style={highlightStyle}>
            {text}
          </Highlight>
        ) : (
          text
        );
      })}
    </Text>
  );
}
