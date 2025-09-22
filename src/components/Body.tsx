"use client";

import { createRecorder } from "@/utils/createRecorder";
import { Box, Container, Flex, Heading, Text, Checkbox, Button, Icon } from "@chakra-ui/react";
import { Camera, CameraOff, Disc, Mic, MicOff, Speaker, Volume2, VolumeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Switch, Case } from "react-if";

type Config = {
  webcam: boolean;
  microphone: boolean;
  sound: boolean;
  watermark: boolean;
}

function RecorderSection(props: { config: Config, onStop: (totalSeconds: number) => void; }) {
  const [seconds, setSeconds] = useState(0);
  const [currentColor, setCurrentColor] = useState('red.200');

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const time = `${
    minutes < 10 ? '0' + minutes : minutes}:${
      remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds
    }`;

  useEffect(() => {
    createRecorder({
      onStart: () => console.log('started...'),
      onStop: () => console.log('stopped'),
      onData: (d) => console.log({ d, url: URL.createObjectURL(d) }),
      onPause: () => console.log('paused...'),
      onResume: () => console.log('resumed...'),
      onError: console.error,
    }).then((rec) => console.log({ rec })).catch(console.error);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setCurrentColor((c) => c === 'red.300' ? 'red.600' : 'red.300');
      setSeconds((s) => s + 1);
    }, 1000);
  }, [time]);
  return (
    <Box display="flex" flexDir="column" alignItems="center">
      <Flex flexWrap="wrap" gap="8">
        <Icon as={Disc} className="disc-icon" stroke={currentColor} />
        {props.config.webcam ? <Camera /> : <CameraOff />}
        {props.config.microphone ? <Mic /> : <MicOff />}
        {props.config.sound ? <Volume2 /> : <VolumeOff />}
      </Flex>
      <Heading my={16} as="h1" fontSize="5xl" fontFamily="mono">{time}</Heading>
      <Button variant="surface">Stop Recording</Button>
    </Box>
  );
}

export default function Body() {
  const [menu, setMenu] = useState<'home' | 'recorder' | 'recording'>('home');
  const [config, setConfig] = useState<Config>({
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
                  p={6}
                  borderRadius={8}
                  display="flex"
                  flexDir="column"
                  gap={4}
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
          <Case condition={menu === 'recorder'}>
            <RecorderSection config={config} onStop={(totalSeconds) => setMenu('recording')} />
          </Case>
        </Switch>
      </Container>
    </Box>
  )
}