import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronDownIcon, TimeIcon, LockIcon } from '@chakra-ui/icons';
import { AuthModal } from './AuthModal';
import { HistoryDrawer } from './HistoryDrawer';
import { getStoredUser, setAuthToken, setStoredUser } from '../api/config';
import './Navbar.css';

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const {
    isOpen: isAuthOpen,
    onOpen: onAuthOpen,
    onClose: onAuthClose,
  } = useDisclosure();
  const {
    isOpen: isHistoryOpen,
    onOpen: onHistoryOpen,
    onClose: onHistoryClose,
  } = useDisclosure();

  useEffect(() => {
    const user = getStoredUser();
    if (user) setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    setAuthToken(null);
    setStoredUser(null);
    setCurrentUser(null);
  };

  return (
    <>
      <Box bg="white" px={6} py={3} shadow="sm" position="sticky" top={0} zIndex={100}>
        <Flex h={14} alignItems="center" justifyContent="space-between">
          {/* Logo */}
          <NavLink to="/">
            <HStack spacing={2}>
              <Text fontSize="2xl" fontWeight="black" color="blue.600" letterSpacing="tight">
                ResuMine
              </Text>
              <Text fontSize="xs" bg="blue.100" color="blue.800" px={2} py={0.5} borderRadius="full" fontWeight="bold">
                2.0
              </Text>
            </HStack>
          </NavLink>

          {/* Navigation Links */}
          <HStack as="nav" spacing={8} display={{ base: 'none', md: 'flex' }}>
            <NavLink
              to="/analyse"
              style={({ isActive }) => ({
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#2563EB' : '#4B5563',
              })}
            >
              Analyze
            </NavLink>
            <NavLink
              to="/compare"
              style={({ isActive }) => ({
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#2563EB' : '#4B5563',
              })}
            >
              Compare
            </NavLink>
            <NavLink
              to="/create"
              style={({ isActive }) => ({
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#2563EB' : '#4B5563',
              })}
            >
              Create
            </NavLink>
          </HStack>

          {/* Right Action: Auth & History */}
          <HStack spacing={4}>
            {currentUser ? (
              <>
                <Button
                  leftIcon={<TimeIcon />}
                  variant="ghost"
                  colorScheme="blue"
                  size="sm"
                  onClick={onHistoryOpen}
                >
                  History
                </Button>

                <Menu>
                  <MenuButton as={Button} variant="ghost" rightIcon={<ChevronDownIcon />} size="sm">
                    <HStack spacing={2}>
                      <Avatar size="xs" name={currentUser.name} bg="blue.500" color="white" />
                      <Text fontWeight="semibold" color="gray.700">
                        {currentUser.name}
                      </Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={onHistoryOpen} icon={<TimeIcon />}>
                      Scan History
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem onClick={handleLogout} color="red.500">
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <Button
                colorScheme="blue"
                size="sm"
                onClick={onAuthOpen}
                leftIcon={<LockIcon />}
              >
                Sign In
              </Button>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={onAuthClose}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={onHistoryClose}
      />
    </>
  );
};

export default Navbar;
