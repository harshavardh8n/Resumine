import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Input,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import { AttachmentIcon } from '@chakra-ui/icons';
import { apiRequest } from '../api/config';
import './analyse.css';

const Compare = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!file1 || !file2) {
      toast({
        title: 'Two resumes required',
        description: 'Please upload both Resume 1 and Resume 2 to perform comparison.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('resume1', file1);
      formData.append('resume2', file2);
      formData.append('targetRole', targetRole);

      const response = await apiRequest('/api/resume/compare', {
        method: 'POST',
        body: formData,
      });

      if (response.success && response.data) {
        setResult(response.data);
        toast({
          title: 'Comparison Complete',
          description: `Winner determined: ${response.data.winner}`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Comparison error:', err);
      toast({
        title: 'Comparison Failed',
        description: err.message || 'Error communicating with backend.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="90vh" bg="gray.50" py={8} px={4}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          <Box textAlign="center" py={4}>
            <Heading size="xl" color="blue.700" mb={2}>
              Head-to-Head Resume Comparison
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Benchmark two candidates or compare iterations of your resume side-by-side with AI evaluation.
            </Text>
          </Box>

          {/* Upload Box */}
          <Card shadow="md" borderRadius="xl" p={6}>
            <form onSubmit={handleCompare}>
              <VStack spacing={6}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                  {/* Resume 1 */}
                  <Box
                    p={6}
                    border="2px dashed"
                    borderColor={file1 ? 'blue.400' : 'gray.300'}
                    borderRadius="lg"
                    textAlign="center"
                    bg={file1 ? 'blue.50' : 'gray.50'}
                    cursor="pointer"
                    onClick={() => document.getElementById('resume1-input').click()}
                    _hover={{ borderColor: 'blue.500' }}
                  >
                    <AttachmentIcon boxSize={8} color="blue.500" mb={2} />
                    <Heading size="sm" color="gray.700">
                      {file1 ? file1.name : 'Upload Resume 1 (PDF/Image)'}
                    </Heading>
                    <input
                      id="resume1-input"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      style={{ display: 'none' }}
                      onChange={(e) => setFile1(e.target.files[0])}
                    />
                  </Box>

                  {/* Resume 2 */}
                  <Box
                    p={6}
                    border="2px dashed"
                    borderColor={file2 ? 'teal.400' : 'gray.300'}
                    borderRadius="lg"
                    textAlign="center"
                    bg={file2 ? 'teal.50' : 'gray.50'}
                    cursor="pointer"
                    onClick={() => document.getElementById('resume2-input').click()}
                    _hover={{ borderColor: 'teal.500' }}
                  >
                    <AttachmentIcon boxSize={8} color="teal.500" mb={2} />
                    <Heading size="sm" color="gray.700">
                      {file2 ? file2.name : 'Upload Resume 2 (PDF/Image)'}
                    </Heading>
                    <input
                      id="resume2-input"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      style={{ display: 'none' }}
                      onChange={(e) => setFile2(e.target.files[0])}
                    />
                  </Box>
                </SimpleGrid>

                <HStack w="full" spacing={4}>
                  <Box flex={1}>
                    <Input
                      placeholder="Target Job Role (e.g. Lead Backend Engineer)"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      bg="white"
                    />
                  </Box>
                  <Button
                    colorScheme="blue"
                    size="md"
                    px={8}
                    type="submit"
                    isLoading={loading}
                    loadingText="Comparing..."
                    isDisabled={!file1 || !file2}
                  >
                    Run Comparison
                  </Button>
                </HStack>
              </VStack>
            </form>
          </Card>

          {/* Results Display */}
          {loading && (
            <Card shadow="md" borderRadius="xl" p={12} textAlign="center">
              <Spinner size="xl" color="blue.500" thickness="4px" mb={3} />
              <Heading size="md" color="blue.700">
                Evaluating Resumes Side-by-Side...
              </Heading>
            </Card>
          )}

          {!loading && result && (
            <VStack spacing={6} align="stretch">
              {/* Winner Announcement */}
              <Card shadow="lg" borderRadius="xl" bg="blue.600" color="white" p={6} textAlign="center">
                <Badge colorScheme="yellow" fontSize="md" px={3} py={1} borderRadius="full" mb={2}>
                  WINNER: {result.winner}
                </Badge>
                <Heading size="md" mb={2}>
                  {result.reasoning}
                </Heading>
              </Card>

              {/* Side by Side Reviews */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Resume 1 Details */}
                <Card shadow="md" borderRadius="xl" p={5}>
                  <CardHeader pb={2}>
                    <Badge colorScheme="blue" mb={1}>
                      Resume 1
                    </Badge>
                    <Heading size="md">{result.resume1Review?.candidateName}</Heading>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                      {result.resume1Review?.atsScore} / 100
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <Text fontWeight="bold" color="gray.700" mb={1}>
                      Key Strengths:
                    </Text>
                    {result.resume1Review?.keyStrengths?.map((s, idx) => (
                      <Text key={idx} fontSize="sm" color="gray.600">
                        • {s}
                      </Text>
                    ))}
                    <Text fontWeight="bold" color="gray.700" mt={3} mb={1}>
                      Major Weaknesses:
                    </Text>
                    {result.resume1Review?.majorWeaknesses?.map((w, idx) => (
                      <Text key={idx} fontSize="sm" color="gray.600">
                        • {w}
                      </Text>
                    ))}
                  </CardBody>
                </Card>

                {/* Resume 2 Details */}
                <Card shadow="md" borderRadius="xl" p={5}>
                  <CardHeader pb={2}>
                    <Badge colorScheme="teal" mb={1}>
                      Resume 2
                    </Badge>
                    <Heading size="md">{result.resume2Review?.candidateName}</Heading>
                    <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                      {result.resume2Review?.atsScore} / 100
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <Text fontWeight="bold" color="gray.700" mb={1}>
                      Key Strengths:
                    </Text>
                    {result.resume2Review?.keyStrengths?.map((s, idx) => (
                      <Text key={idx} fontSize="sm" color="gray.600">
                        • {s}
                      </Text>
                    ))}
                    <Text fontWeight="bold" color="gray.700" mt={3} mb={1}>
                      Major Weaknesses:
                    </Text>
                    {result.resume2Review?.majorWeaknesses?.map((w, idx) => (
                      <Text key={idx} fontSize="sm" color="gray.600">
                        • {w}
                      </Text>
                    ))}
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Head-to-Head Criteria Breakdown */}
              {result.headToHeadComparison && (
                <Card shadow="md" borderRadius="xl" p={6}>
                  <Heading size="sm" mb={4} color="gray.700">
                    Direct Criteria Breakdown
                  </Heading>
                  <VStack spacing={3} align="stretch">
                    <Box p={3} bg="gray.50" borderRadius="md">
                      <Text fontWeight="bold" color="blue.700">
                        Visual Appeal & Layout:
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {result.headToHeadComparison.visualAppeal}
                      </Text>
                    </Box>
                    <Box p={3} bg="gray.50" borderRadius="md">
                      <Text fontWeight="bold" color="blue.700">
                        Content Relevance:
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {result.headToHeadComparison.contentRelevance}
                      </Text>
                    </Box>
                    <Box p={3} bg="gray.50" borderRadius="md">
                      <Text fontWeight="bold" color="blue.700">
                        Quantified Impact:
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {result.headToHeadComparison.quantifiedImpact}
                      </Text>
                    </Box>
                  </VStack>
                </Card>
              )}
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Compare;
