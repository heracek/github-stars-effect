import { TextEncoder } from 'text-encoding';

if (!global.TextEncoder) {
  // Fixes: https://github.com/facebook/hermes/issues/948#issuecomment-1484240071
  global.TextEncoder = TextEncoder;
}
