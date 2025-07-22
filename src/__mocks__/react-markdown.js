import React from 'react';
import PropTypes from 'prop-types';

const ReactMarkdown = ({ children }) => {
  return <div data-testid="markdown">{children}</div>;
};

ReactMarkdown.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ReactMarkdown;
