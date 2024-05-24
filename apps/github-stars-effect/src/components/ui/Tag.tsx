import { Text, type TextProps, View } from 'tamagui';

export function Tag({ theme, ...props }: TextProps) {
  return (
    <View
      theme={theme}
      display="inline"
      borderWidth={1}
      paddingHorizontal="$1"
      borderRadius="$2"
      borderColor="$color7"
      backgroundColor="$color2"
    >
      <Text color="$color9" {...props}></Text>
    </View>
  );
}
