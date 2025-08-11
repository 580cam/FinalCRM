import React from 'react';

// Simple mock for next/script in tests: render children, skip loading external script
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Script = ({ children }: any) => <>{children}</>;

export default Script;
