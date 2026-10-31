import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Input,
  Textarea,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { marked } from 'marked';
import { apiRequest } from '../api/config';
import './analyse.css';

const Creater = () => {
  const [info, setInfo] = useState({
    name: '',
    email: '',
    skills: '',
    projects: '',
    education: '',
    exp: '',
    targetRole: '',
  });

  const [loading, setLoading] = useState(false);
  const [resumeHtml, setResumeHtml] = useState('');
  const [resumeMarkdown, setResumeMarkdown] = useState('');
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!info.name || !info.email || !info.skills) {
      toast({
        title: 'Missing Required Fields',
        description: 'Name, Email, and Skills are required to build your resume.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setResumeHtml('');
    setResumeMarkdown('');

    try {
      const response = await apiRequest('/api/resume/create', {
        method: 'POST',
        body: JSON.stringify({
          ...info,
          skills: info.skills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });

      if (response.success && response.data?.markdown) {
        const md = response.data.markdown;
        setResumeMarkdown(md);
        setResumeHtml(marked.parse(md));
        toast({
          title: 'Resume Generated!',
          description: 'Your executive ATS-optimized resume is ready.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Create error:', err);
      toast({
        title: 'Generation Failed',
        description: err.message || 'Error communicating with backend.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resumeMarkdown);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Resume markdown copied to clipboard',
      status: 'info',
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box minH="90vh" bg="gray.50" py={8} px={4}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          <Box textAlign="center" py={4}>
            <Heading size="xl" color="blue.700" mb={2}>
              AI Executive Resume Builder
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Provide your skills and accomplishments. Gemini formats them into Google XYZ-style bullet points.
            </Text>
          </Box>

          <Flex direction={{ base: 'column', lg: 'row' }} gap={8} align="flex-start">
            {/* Form */}
            <Card w={{ base: '100%', lg: '45%' }} shadow="md" borderRadius="xl">
              <CardHeader pb={2}>
                <Heading size="md" color="blue.800">
                  Candidate Information
                </Heading>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontWeight="medium" fontSize="sm" mb={1}>
                        Full Name *
                      </Text>
                      <Input
                        name="name"
                        placeholder="e.g. Alex Morgan"
                        value={info.name}
                        onChange={handleInput}
                        required
                      />
                    </Box>

                    <Box>
                      <Text fontWeight="medium" fontSize="sm" mb={1}>
                        Email Address *
                      </Text>
                      <Input
                        name="email"
                        type="email"
                        placeholder="e.g. alex@example.com"
                        value={info.email}
                        onChange={handleInput}
                        required
                      />
                    </Box>

                    <Box>
                      <Text fontWeight="medium" fontSize="sm" mb={1}>
                        Target Job Title
                      </Text>
                      <Input
                        name="targetRole"
                        placeholder="e.g. Senior Backend Engineer"
                        value={info.targetRole}
                        onChange={handleInput}
                      />
                    </Box>

                    <Box>
                      <Text fontWeight="medium" fontSize="sm" mb={1}>
                        Skills (comma-separated) *
                      </Text>
                      <Input
                        name="skills"
                        placeholder="Node.js, Express, MongoDB, TypeScript, Docker"
                        value={info.skills}
                        onChange={handleInput}
                        required
                      />
                    </Box>

                    <Box>
                      <Text fontWeight="medium" fontSize="sm" mb={1}>
                        Education & Certifications
                      </Text>
                      <Input
                        name="education"
                        placeholder="BS Computer Science, University of XYZ"
                        value={info.education}
                        onChange={handleInput}
                      />
                    </Box>

                    <Box>
                      <Text fontWeight="medium" fontSize="sm" mb={1}>
                        Work Experience & Roles
                      </Text>
                      <Textarea
                        name="exp"
                        rows={3}
                        placeholder="Software Engineer at Acme Corp (2022-Present): Led backend migration, improved latency by 35%..."
                        value={info.exp}
                        onChange={handleInput}
                      />
                    </Box>

                    <Box>
                      <Text fontWeight="medium" fontSize="sm" mb={1}>
                        Key Projects
                      </Text>
                      <Textarea
                        name="projects"
                        rows={2}
                        placeholder="Built an open-source task scheduler with 500+ GitHub stars..."
                        value={info.projects}
                        onChange={handleInput}
                      />
                    </Box>

                    <Button
                      colorScheme="blue"
                      size="lg"
                      w="full"
                      type="submit"
                      isLoading={loading}
                      loadingText="Writing Resume with Gemini..."
                    >
                      Generate Optimized Resume
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </Card>

            {/* Generated Resume Preview */}
            <Box w={{ base: '100%', lg: '55%' }}>
              {loading && (
                <Card shadow="md" borderRadius="xl" p={12} textAlign="center">
                  <Spinner size="xl" color="blue.500" thickness="4px" mb={4} />
                  <Heading size="md" color="blue.700">
                    Drafting Your Resume...
                  </Heading>
                  <Text color="gray.500" mt={2}>
                    Applying action verbs, XYZ metric structures, and executive styling.
                  </Text>
                </Card>
              )}

              {!loading && !resumeHtml && (
                <Card shadow="sm" borderRadius="xl" p={12} textAlign="center" bg="white" border="1px dashed" borderColor="gray.300">
                  <Heading size="md" color="gray.600">
                    Your Generated Resume Preview
                  </Heading>
                  <Text color="gray.500" mt={2}>
                    Fill out the candidate form on the left and click Generate to see the ATS-ready preview.
                  </Text>
                </Card>
              )}

              {!loading && resumeHtml && (
                <Card shadow="lg" borderRadius="xl" bg="white" p={6}>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md" color="blue.800">
                      Generated Resume Preview
                    </Heading>
                    <Button
                      leftIcon={copied ? <CheckIcon /> : <CopyIcon />}
                      colorScheme={copied ? 'green' : 'blue'}
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                    >
                      {copied ? 'Copied' : 'Copy Markdown'}
                    </Button>
                  </Flex>
                  <Divider mb={4} />
                  <Box
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                    maxH="70vh"
                    overflowY="auto"
                    fontSize="sm"
                    lineHeight="tall"
                    dangerouslySetInnerHTML={{ __html: resumeHtml }}
                  />
                </Card>
              )}
            </Box>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default Creater;
