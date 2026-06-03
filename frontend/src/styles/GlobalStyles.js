import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    background-color: #f7f9fc;
    color: #1c1b1f; /* M3 Neutral 10 */
  }

  * {
    box-sizing: border-box;
  }
`;
