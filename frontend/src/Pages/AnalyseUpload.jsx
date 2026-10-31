import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Progress,
  List,
  ListItem,
  ListIcon,
  Tag,
  Wrap,
  WrapItem,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Input,
  useToast,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  WarningTwoIcon,
  InfoIcon,
  StarIcon,
  AttachmentIcon,
} from '@chakra-ui/icons';
import { apiRequest } from '../api/config';
import './analyse.css';

const AnalyseUpload = () => {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum allowed file size is 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setFile(selected);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a PDF or image resume to analyze',
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
      formData.append('resume', file);
      if (targetRole) formData.append('targetRole', targetRole);
      if (jobDescription) formData.append('jobDescription', jobDescription);

      const response = await apiRequest('/api/resume/analyze', {
        method: 'POST',
        body: formData,
      });

      if (response.success && response.data) {
        setResult(response.data);
        toast({
          title: 'Analysis Complete!',
          description: `Resume scored ${response.data.atsScore}/100`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      toast({
        title: 'Analysis Failed',
        description: err.message || 'Unable to analyze resume. Please verify backend connection.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 65) return 'teal';
    if (score >= 50) return 'orange';
    return 'red';
  };

  return (
    <Box minH="90vh" bg="gray.50" py={8} px={4}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          <Box textAlign="center" py={4}>
            <Heading size="xl" color="blue.700" mb={2}>
              AI-Powered ATS Resume Scanner
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Upload your resume in PDF or image format to receive instant ATS scoring, keyword gap analysis, and tailored recommendations.
            </Text>
          </Box>

          <Flex
            direction={{ base: 'column', lg: 'row' }}
            gap={8}
            align="flex-start"
          >
            {/* Left Column: Upload Form */}
            <Card
              w={{ base: '100%', lg: '40%' }}
              shadow="md"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
            >
              <CardHeader pb={2}>
                <Heading size="md" color="blue.800">
                  Upload Document
                </Heading>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleAnalyze}>
                  <VStack spacing={5} align="stretch">
                    <Box
                      p={6}
                      border="2px dashed"
                      borderColor={file ? 'blue.400' : 'gray.300'}
                      borderRadius="lg"
                      textAlign="center"
                      bg={file ? 'blue.50' : 'gray.50'}
                      cursor="pointer"
                      onClick={() => document.getElementById('resume-file-input').click()}
                      transition="all 0.2s"
                      _hover={{ borderColor: 'blue.500', bg: 'blue.50' }}
                    >
                      <AttachmentIcon boxSize={8} color="blue.500" mb={2} />
                      <Text fontWeight="semibold" color="gray.700">
                        {file ? file.name : 'Click to upload PDF or Image'}
                      </Text>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Supported formats: PDF, PNG, JPG (Max 5MB)
                      </Text>
                      <input
                        id="resume-file-input"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />
                    </Box>

                    <Box>
                      <Text fontWeight="medium" fontSize="sm" mb={1} color="gray.700">
                        Target Role (Optional)
                      </Text>
                      <Input
                        placeholder="e.g. Senior Full Stack Engineer"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        bg="white"
                      />
                    </Box>

                    <Box>
                      <Text fontWeight="medium" fontSize="sm" mb={1} color="gray.700">
                        Job Description / Keywords (Optional)
                      </Text>
                      <Input
                        placeholder="Paste target job requirements or keywords"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        bg="white"
                      />
                    </Box>

                    <Button
                      colorScheme="blue"
                      size="lg"
                      w="full"
                      type="submit"
                      isLoading={loading}
                      loadingText="Evaluating Resume..."
                      isDisabled={!file}
                    >
                      Scan & Score Resume
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </Card>

            {/* Right Column: Results Dashboard */}
            <Box w={{ base: '100%', lg: '60%' }}>
              {loading && (
                <Card shadow="md" borderRadius="xl" p={12} textAlign="center">
                  <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                    <Heading size="md" color="blue.700">
                      Analyzing with Gemini 2.0 Flash...
                    </Heading>
                    <Text color="gray.500">
                      Inspecting document typography, action verbs, quantified metrics, and ATS compatibility.
                    </Text>
                  </VStack>
                </Card>
              )}

              {!loading && !result && (
                <Card
                  shadow="sm"
                  borderRadius="xl"
                  p={12}
                  textAlign="center"
                  bg="white"
                  border="1px dashed"
                  borderColor="gray.300"
                >
                  <StarIcon boxSize={10} color="gray.300" mb={3} />
                  <Heading size="md" color="gray.600">
                    Your ATS Score Report will appear here
                  </Heading>
                  <Text color="gray.500" mt={2}>
                    Upload a resume on the left to inspect detailed category breakdowns, missing keywords, and strengths.
                  </Text>
                </Card>
              )}

              {!loading && result && (
                <VStack spacing={6} align="stretch">
                  {/* Top Score Banner */}
                  <Card shadow="md" borderRadius="xl" bg="white" p={6}>
                    <Flex
                      direction={{ base: 'column', sm: 'row' }}
                      justify="space-between"
                      align={{ base: 'flex-start', sm: 'center' }}
                      gap={4}
                    >
                      <Box>
                        <Badge colorScheme="blue" mb={1} fontSize="xs">
                          Candidate
                        </Badge>
                        <Heading size="lg" color="gray.800">
                          {result.candidateName || 'Candidate Profile'}
                        </Heading>
                        <Text color="gray.600" mt={1} fontSize="sm">
                          {result.summary}
                        </Text>
                      </Box>
                      <Box
                        textAlign="center"
                        p={4}
                        borderRadius="xl"
                        bg={`${getScoreColor(result.atsScore)}.50`}
                        border="2px solid"
                        borderColor={`${getScoreColor(result.atsScore)}.300`}
                        minW="120px"
                      >
                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                          ATS Score
                        </Text>
                        <Heading size="2xl" color={`${getScoreColor(result.atsScore)}.600`}>
                          {result.atsScore}
                        </Heading>
                        <Text fontSize="xs" color="gray.500">
                          out of 100
                        </Text>
                      </Box>
                    </Flex>
                  </Card>

                  {/* Category Scoring Breakdown */}
                  {result.scoringBreakdown && (
                    <Card shadow="md" borderRadius="xl" bg="white" p={6}>
                      <Heading size="sm" mb={4} color="gray.700">
                        Category Breakdown
                      </Heading>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <Flex justify="space-between" fontSize="sm" mb={1}>
                            <Text fontWeight="medium">Formatting & ATS Readability</Text>
                            <Text fontWeight="bold">{result.scoringBreakdown.formatting} / 25</Text>
                          </Flex>
                          <Progress
                            value={(result.scoringBreakdown.formatting / 25) * 100}
                            colorScheme="blue"
                            borderRadius="full"
                            size="sm"
                          />
                        </Box>
                        <Box>
                          <Flex justify="space-between" fontSize="sm" mb={1}>
                            <Text fontWeight="medium">Impact & Quantified Metrics</Text>
                            <Text fontWeight="bold">{result.scoringBreakdown.impactAndMetrics} / 25</Text>
                          </Flex>
                          <Progress
                            value={(result.scoringBreakdown.impactAndMetrics / 25) * 100}
                            colorScheme="teal"
                            borderRadius="full"
                            size="sm"
                          />
                        </Box>
                        <Box>
                          <Flex justify="space-between" fontSize="sm" mb={1}>
                            <Text fontWeight="medium">Skills & Keyword Coverage</Text>
                            <Text fontWeight="bold">{result.scoringBreakdown.skillsAndKeywords} / 25</Text>
                          </Flex>
                          <Progress
                            value={(result.scoringBreakdown.skillsAndKeywords / 25) * 100}
                            colorScheme="purple"
                            borderRadius="full"
                            size="sm"
                          />
                        </Box>
                        <Box>
                          <Flex justify="space-between" fontSize="sm" mb={1}>
                            <Text fontWeight="medium">Experience Relevance</Text>
                            <Text fontWeight="bold">{result.scoringBreakdown.experienceRelevance} / 25</Text>
                          </Flex>
                          <Progress
                            value={(result.scoringBreakdown.experienceRelevance / 25) * 100}
                            colorScheme="cyan"
                            borderRadius="full"
                            size="sm"
                          />
                        </Box>
                      </VStack>
                    </Card>
                  )}

                  {/* Strengths & Weaknesses */}
                  <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                    <Card flex={1} shadow="md" borderRadius="xl" bg="white" p={5}>
                      <HStack mb={3}>
                        <CheckCircleIcon color="green.500" />
                        <Heading size="sm" color="green.700">
                          Key Strengths
                        </Heading>
                      </HStack>
                      <List spacing={2}>
                        {result.strengths?.map((item, idx) => (
                          <ListItem key={idx} fontSize="sm" color="gray.700">
                            • {item}
                          </ListItem>
                        ))}
                      </List>
                    </Card>

                    <Card flex={1} shadow="md" borderRadius="xl" bg="white" p={5}>
                      <HStack mb={3}>
                        <WarningTwoIcon color="red.500" />
                        <Heading size="sm" color="red.700">
                          Areas to Improve
                        </Heading>
                      </HStack>
                      <List spacing={2}>
                        {result.weaknesses?.map((item, idx) => (
                          <ListItem key={idx} fontSize="sm" color="gray.700">
                            • {item}
                          </ListItem>
                        ))}
                      </List>
                    </Card>
                  </Flex>

                  {/* Actionable Improvement Checklist */}
                  <Card shadow="md" borderRadius="xl" bg="white" p={6}>
                    <HStack mb={3}>
                      <InfoIcon color="blue.500" />
                      <Heading size="sm" color="blue.800">
                        Actionable Recommendations
                      </Heading>
                    </HStack>
                    <List spacing={2}>
                      {result.improvements?.map((item, idx) => (
                        <ListItem key={idx} fontSize="sm" color="gray.700" display="flex" alignItems="flex-start">
                          <ListIcon as={CheckCircleIcon} color="blue.500" mt={1} />
                          <Text>{item}</Text>
                        </ListItem>
                      ))}
                    </List>
                  </Card>

                  {/* Suggested Keywords */}
                  {result.suggestedKeywords && result.suggestedKeywords.length > 0 && (
                    <Card shadow="md" borderRadius="xl" bg="white" p={6}>
                      <Heading size="sm" mb={3} color="gray.700">
                        Suggested Keywords to Add
                      </Heading>
                      <Wrap spacing={2}>
                        {result.suggestedKeywords.map((kw, idx) => (
                          <WrapItem key={idx}>
                            <Tag size="md" colorScheme="blue" variant="subtle" borderRadius="full">
                              +{kw}
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Card>
                  )}
                </VStack>
              )}
            </Box>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default AnalyseUpload;
