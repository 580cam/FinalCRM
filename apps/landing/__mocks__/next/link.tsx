import React from 'react';

type Props = {
  href: string | { pathname: string };
  children: React.ReactNode;
  [key: string]: any;
};

const Link = ({ href, children, ...rest }: Props) => (
  <a href={typeof href === 'string' ? href : href?.pathname || '#'} {...rest}>
    {children}
  </a>
);

export default Link;
