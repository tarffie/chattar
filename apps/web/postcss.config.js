export default {
  plugins: {
    "postcss-preset-env": {
      stage: 1, // enables even experimental stuff
      features: {
        "cascade-layers": true,
        "color-functional-notation": true,
        "has-selector": true,
        "nesting-rules": true, // you’ll love this once you try it
        "custom-selectors": true,
        "is-pseudo-class": true,
        "focus-visible-selector": true,
        "logical-properties-and-values": true,
        "dir-pseudo-class": true,
      },
    },
    autoprefixer: {},
  },
};
