import React from 'react';

// Simple Next.js Image mock for Jest
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NextImage = ({ src, alt = '', ...rest }: any) => (
  // Use img for testing
  // eslint-disable-next-line @next/next/no-img-element
  <img src={typeof src === 'string' ? src : ''} alt={alt} {...rest} />
);

export default NextImage;
