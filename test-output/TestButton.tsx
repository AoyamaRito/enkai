'use client';

import React, { useState } from 'react';

type ButtonProps = {
  initialCount?: number;
  buttonText?: string;
};

const CounterButton = ({ initialCount = 0, buttonText = "Increment" }: ButtonProps) => {
  const [count, setCount] = useState<number>(initialCount);

  const incrementCount = () => {
    setCount(prevCount => prevCount + 1);
  };

  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline m-2"
      onClick={incrementCount}
      aria-label="increment"
    >
      {buttonText} ({count})
    </button>
  );
};

export default CounterButton;