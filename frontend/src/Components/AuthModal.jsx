import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { apiRequest, setAuthToken, setStoredUser } from '../api/config';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });

      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
        setStoredUser(res.data.user);
        toast({
          title: 'Welcome back!',
          description: `Logged in as ${res.data.user.name || res.data.user.email}`,
          status: 'success',
          duration: 3000,
        });
        onAuthSuccess(res.data.user);
        onClose();
      }
    } catch (err) {
      toast({
        title: 'Login failed',
        description: err.message,
        status: 'error',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      });

      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
        setStoredUser(res.data.user);
        toast({
          title: 'Account created!',
          description: `Welcome to ResuMine, ${res.data.user.name}`,
          status: 'success',
          duration: 3000,
        });
        onAuthSuccess(res.data.user);
        onClose();
      }
    } catch (err) {
      toast({
        title: 'Registration failed',
        description: err.message,
        status: 'error',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl">
        <ModalHeader textAlign="center" color="blue.700">
          ResuMine Account
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs isFitted variant="enclosed" index={tabIndex} onChange={setTabIndex}>
            <TabList mb="1em">
              <Tab fontWeight="bold">Sign In</Tab>
              <Tab fontWeight="bold">Create Account</Tab>
            </TabList>
            <TabPanels>
              {/* Sign In */}
              <TabPanel>
                <form onSubmit={handleLogin}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Email Address</FormLabel>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Password</FormLabel>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      />
                    </FormControl>
                    <Button
                      colorScheme="blue"
                      w="full"
                      type="submit"
                      isLoading={loading}
                      mt={2}
                    >
                      Sign In
                    </Button>
                  </VStack>
                </form>
              </TabPanel>

              {/* Create Account */}
              <TabPanel>
                <form onSubmit={handleRegister}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Full Name</FormLabel>
                      <Input
                        placeholder="Your Name"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Email Address</FormLabel>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Password (min 6 characters)</FormLabel>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      />
                    </FormControl>
                    <Button
                      colorScheme="blue"
                      w="full"
                      type="submit"
                      isLoading={loading}
                      mt={2}
                    >
                      Create Free Account
                    </Button>
                  </VStack>
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
