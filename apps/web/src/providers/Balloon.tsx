"use client";

import { parse, stringify } from "@/lib/utils";
import React, {
  createContext,
  useState,
  useContext,
  type PropsWithChildren,
  useCallback,
} from "react";

const BALLOONS_KEY = "balloons";

type Balloon = {
  hash: string;
  pk: `0x${string}`;
  delegation: string;
};

type Balloons = Record<string, Balloon>;

type BalloonInput = {
  index: string;
} & Balloon;

// Create a new context
const BalloonsContext = createContext<{
  balloons: Balloons;
  saveBalloon: (input: BalloonInput) => void;
  resetBalloons: () => void;
}>({
  balloons: {},
  saveBalloon: (input: BalloonInput) => {
    console.log(input.index);
  },
  resetBalloons: () => {
    console.log("reset balloons");
  },
});

// Create a provider component
export const BalloonsProvider = ({ children }: PropsWithChildren) => {
  const [balloons, setBalloons] = useState<Balloons>(() => {
    if (typeof window === "undefined" || !window.localStorage) {
      return {};
    }
    // Get the credential from localStorage when the component mounts
    const storedBalloons = localStorage.getItem(BALLOONS_KEY);
    return storedBalloons ? parse<Balloons>(storedBalloons) : {};
  });

  const saveBalloon = useCallback(
    ({ index, hash, pk, delegation }: BalloonInput) => {
      setBalloons((prevBalloons) => {
        const newBalloons = { ...prevBalloons };
        newBalloons[index] = { hash, pk, delegation };
        if (localStorage) {
          localStorage?.setItem(BALLOONS_KEY, stringify(newBalloons));
        }
        return newBalloons;
      });
    },
    [],
  );

  const resetBalloons = useCallback(() => {
    setBalloons({});
    localStorage.removeItem(BALLOONS_KEY);
  }, []);

  return (
    <BalloonsContext.Provider value={{ balloons, saveBalloon, resetBalloons }}>
      {children}
    </BalloonsContext.Provider>
  );
};

// Create a custom hook for using the account credential context
export const useBalloons = () => {
  const context = useContext(BalloonsContext);
  if (context === undefined) {
    throw new Error(
      "useAccountCredential must be used within a AccountCredentialProvider",
    );
  }
  return context;
};
