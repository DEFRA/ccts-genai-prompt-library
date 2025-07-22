import React from 'react';
import PropTypes from 'prop-types';

const PrismComponent = ({ children }) => {
  return <pre data-testid="syntax-highlighter">{children}</pre>;
};

PrismComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

const SyntaxHighlighter = {
  Prism: PrismComponent
};

export default SyntaxHighlighter;
