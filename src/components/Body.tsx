"use client";

import { createRecorder, downloadFile, RecorderObject } from "@/utils/createRecorder";
import { Box, Container, Flex, Heading, Text, Checkbox, Button, Icon, Input } from "@chakra-ui/react";
import { ArrowDown, Camera, CameraOff, Disc, Mic, MicOff, Volume2, VolumeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Switch, Case, If, Then, Else } from "react-if";

type Config = {
  webcam: boolean;
  microphone: boolean;
  sound: boolean;
  watermark: boolean;
}

let isRequesting = false; // external variable so that it is updated immediately
function RecorderSection(props: {
  config: Config,
  onStop: (totalSeconds: number, url: string) => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const [currentColor, setCurrentColor] = useState('red.200');
  const recorderRef = useRef<RecorderObject | undefined>(undefined);

  const [isStarted, setStart] = useState(false);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const time = `${minutes < 10 ? '0' + minutes : minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds
    }`;

  useEffect(() => {
    if (!isRequesting) {
      isRequesting = true;
      createRecorder({
        ...props.config,
        systemSound: props.config.sound,
        camera: props.config.webcam,
      }, {
        onStart: () => setStart(true),
        onStop: () => setStart(false),
        onData: (d) => {
          const url = URL.createObjectURL(d);
          console.log({ d, url: url });
          props.onStop(seconds, url);
        },
        onPause: () => console.log('paused...'),
        onResume: () => console.log('resumed...'),
        onError: console.error,
      }).then((rec) => {
        recorderRef.current = rec;
        console.log({ rec, recorderRef });
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (isStarted) setTimeout(() => {
      setCurrentColor((c) => c === 'red.300' ? 'red.600' : 'red.300');
      setSeconds((s) => s + 1);
    }, 1000);
  }, [time, isStarted]);
  return (
    <Box display="flex" flexDir="column" alignItems="center">
      <Flex flexWrap="wrap" gap="8">
        <Icon as={Disc} className="disc-icon" stroke={currentColor} />
        {props.config.webcam ? <Camera /> : <CameraOff />}
        {props.config.microphone ? <Mic /> : <MicOff />}
        {props.config.sound ? <Volume2 /> : <VolumeOff />}
      </Flex>
      <Heading my={16} as="h1" fontSize="5xl" fontFamily="mono">{time}</Heading>
      <If condition={isStarted}>
        <Then>
          <Button variant="surface" onClick={() => recorderRef.current?.stop()}>STOP</Button>
        </Then>
        <Else>
          <Button variant="solid" onClick={() => recorderRef.current?.start()}>START</Button>
        </Else>
      </If>
    </Box>
  );
}

const defaultConfig = {
  webcam: false,
  microphone: true,
  sound: true,
  watermark: true,
};
export default function Body() {
  const [menu, setMenu] = useState<'home' | 'recorder' | 'recording'>('home');
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const restart = () => {
    setUrl(() => '');
    setName(() => '');
    setConfig(() => defaultConfig);
    setMenu(() => 'home');
  }
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
            <RecorderSection config={config} onStop={(sec, url) => {
              setMenu('recording');
              setUrl(url);
            }} />
          </Case>
          <Case condition={menu === 'recording'}>
            <Flex gap="2" justifyContent="space-around" flexWrap="wrap">
              <Box display="flex" flexDir="column" gap={2} w={{ base: 'full', md: '48%' }}>
                <Heading as="h1" textAlign="center" fontSize="2xl">Record videos for FREE</Heading>
                <Text textAlign="center">Easily record your screen in matter of seconds. No need for installing any extra tools. Record as many times as you want, no payment is required.</Text>
                <Button variant="solid" maxW="200px" mx="auto" onClick={() => restart()}>Start NEW Recording</Button>
              </Box>
              <Box display="flex" flexDir="column" w={{ base: 'full', md: '48%' }}>
                <Box
                  id="recorder-config"
                  p={6}
                  border="2px solid gray"
                  borderRadius={8}
                  display="flex"
                  flexDir="column"
                  gap={4}
                >
                  <Heading as="h2" fontSize="lg">Download your video</Heading>
                  <video src={url} autoPlay controls muted />
                  <Box display="flex">
                    <Input
                      type="text"
                      variant="outline"
                      flexGrow={1}
                      placeholder="File name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Button variant="solid" w="30%" minW="100px" onClick={() => downloadFile(url, name)}>
                      <ArrowDown /> Download
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Flex>
          </Case>
        </Switch>
      </Container>
    </Box>
  )
}