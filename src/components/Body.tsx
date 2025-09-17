import { Box, Container, Flex, Heading, Text, Checkbox, Button } from "@chakra-ui/react";
import { Disc } from "lucide-react";
import { useState } from "react";
import { Switch, Case } from "react-if";

export default function Body() {
  const [menu, setMenu] = useState<'home' | 'recorder' | 'recording'>('home');
  const [config, setConfig] = useState({
    webcam: false,
    microphone: true,
    sound: true,
    watermark: true,
  });
  return (
    <Box display="flex" flexDir="column">
      <Container display="flex" flexDir="column" py={8}>
        <Switch>
          <Case condition={menu === 'home'}>
            <Flex gap="2" justifyContent="space-around" flexWrap="wrap">
              <Box display="flex" flexDir="column" w={{ base: 'full', md: '48%' }}>
                <Heading as="h1" textAlign="center" fontSize="2xl">Record videos for FREE</Heading>
                <Text textAlign="center">Easily record your screen in matter of seconds. No need for installing any extra tools. Record as many times as you want, no payment is required.</Text>
              </Box>
              <Box display="flex" flexDir="column" w={{ base: 'full', md: '48%' }}>
                <Box
                  id="recorder-config"
                  bgColor="gray.200"
                  _dark={{ bgColor: 'gray.700' }}
                  p={4}
                  borderRadius={8}
                  display="flex"
                  flexDir="column"
                  gap={2}
                >
                  <Heading as="h2" fontSize="lg">Choose your options and RECORD for FREE</Heading>
                  <Flex
                    flexWrap='wrap'
                    gap={1}
                    justifyContent="space-between"
                    bgColor="whiteAlpha.600"
                    borderRadius={8}
                    py={4}
                    px={4}
                  >
                    {Object.keys(config).map((key) => (
                      <Checkbox.Root
                        key={key}
                        checked={config[key as keyof typeof config]}
                        variant="solid"
                        cursor="pointer"
                        onChange={() => {
                          setConfig((c) => ({
                            ...c,
                            [key]: !c[key as keyof typeof config]
                          }))
                        }}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label textTransform="capitalize">{key}</Checkbox.Label>
                      </Checkbox.Root>
                    ))}
                  </Flex>
                  <Button variant="solid" w="25%" minW="100px" onClick={() => setMenu('recorder')}>
                    <Disc /> RECORD
                  </Button>
                </Box>
              </Box>
            </Flex>
          </Case>
        </Switch>
      </Container>
    </Box>
  )
}