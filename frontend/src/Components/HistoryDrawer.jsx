import React, { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Spinner,
} from '@chakra-ui/react';
import { apiRequest } from '../api/config';

export const HistoryDrawer = ({ isOpen, onClose, onSelectRecord }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/resume/history');
      if (res.success && res.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.warn('Failed to load history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" color="blue.700">
          Your Resume Scan History
        </DrawerHeader>

        <DrawerBody>
          {loading ? (
            <VStack py={12}>
              <Spinner size="lg" color="blue.500" />
              <Text color="gray.500">Loading your history...</Text>
            </VStack>
          ) : history.length === 0 ? (
            <Box textAlign="center" py={12} color="gray.500">
              <Text fontSize="md">No scans found yet.</Text>
              <Text fontSize="xs" mt={1}>
                Analyze a resume to automatically track your score over time.
              </Text>
            </Box>
          ) : (
            <VStack spacing={4} align="stretch" pt={4}>
              {history.map((record) => (
                <Box
                  key={record._id}
                  p={4}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                  _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
                  cursor="pointer"
                  onClick={() => {
                    if (onSelectRecord) onSelectRecord(record);
                    onClose();
                  }}
                >
                  <HStack justify="space-between" mb={1}>
                    <Text fontWeight="bold" color="gray.800" noOfLines={1}>
                      {record.fileName || record.candidateName || 'Resume'}
                    </Text>
                    <Badge
                      colorScheme={
                        record.atsScore >= 80 ? 'green' : record.atsScore >= 60 ? 'teal' : 'red'
                      }
                      fontSize="sm"
                    >
                      {record.atsScore} / 100
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.500">
                    Role: {record.targetRole || 'General'}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    {new Date(record.createdAt).toLocaleDateString()} at{' '}
                    {new Date(record.createdAt).toLocaleTimeString()}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
