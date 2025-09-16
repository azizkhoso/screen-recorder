"use client";

import { Flex, Text, IconButton } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react"; // lightweight icon lib, but you can use @chakra-ui/icons too

export default function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <Flex
      as="header"
      px={6}
      py={4}
      align="center"
      justify="space-between"
      borderBottom="1px solid"
      borderColor="border"
    >
      {/* App Title */}
      <Text fontSize="lg" fontWeight="bold">
        Easy Screen Recorder
      </Text>

      {/* Color Mode Toggle */}
      <IconButton
        aria-label="Toggle color mode"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        variant="ghost"
        rounded="full"
      >
        {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
      </IconButton>
    </Flex>
  );
}
