import type { Preview } from "@storybook/nextjs-vite";
import "./fonts.css";
import "../src/styles/tokens.css";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    layout: "centered",
  },
};

export default preview;
