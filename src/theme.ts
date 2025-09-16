// src/theme.ts
import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  // example: tokens, semanticTokens, breakpoints, cssVarsRoot, etc.
  cssVarsRoot: ":where(:root, :host)",
  strictTokens: true, // use chakra ui theme tokens only
  /* theme: {
    tokens: {
      colors: {
        // provide token values
        brand: {
          50: { value: "#f5f7ff" },
          500: { value: "#4f46e5" },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: { value: "{colors.white}" },
      },
    },
    breakpoints: { sm: "320px", md: "768px", lg: "960px" },
  }, */
});

const system = createSystem(defaultConfig, config);

export default system;
