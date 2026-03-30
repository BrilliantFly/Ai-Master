declare module 'prismjs' {
  const prism: {
    highlightAll: () => void;
    highlightElement: (element: Element) => void;
    languages: Record<string, any>;
  };
  export default prism;
}
