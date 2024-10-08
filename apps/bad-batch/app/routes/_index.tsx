import type { MetaFunction } from '@remix-run/node'
import { styled, Text, View } from '@tamagui/web'
import { Input, Button } from 'tamagui'
import { useState } from 'react'

export const meta: MetaFunction = () => {
  return [
    { title: 'AI Batch Processing Service' },
    {
      name: 'description',
      content: 'Efficient batch processing with AI for your data needs.',
    },
  ]
}

const Section = styled(View, {
  tag: 'section',
  padding: '$large',
  gap: '$large',
  $smallScreen: {
    padding: '$medium',
  },
  $mediumScreen: {
    padding: '$large',
    maxWidth: 600,
  },
  $largeScreen: {
    padding: '$extraLarge',
  },
})

const FormContainer = styled(View, {
  gap: '$medium',
  width: '100%',
  maxWidth: 500,
})

export default function Index() {
  const [batchSize, setBatchSize] = useState('')
  const [processingStatus, setProcessingStatus] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulating batch processing
    setProcessingStatus('Processing...')
    setTimeout(() => {
      setProcessingStatus(`Processed ${batchSize} items successfully!`)
    }, 2000)
  }

  return (
    <View
      flexDirection="column"
      gap={16}
      backgroundColor="$background"
      minHeight="100vh"
    >
      <View
        tag="header"
        padding="$large"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text tag="h1" fontSize={32}>
          AI Batch Processing Service
        </Text>
      </View>
      <Section>
        <Text tag="h2" fontSize={24}>
          Start Batch Processing
        </Text>
        <Text>
          Our AI-powered batch processing service allows you to efficiently process large amounts of data. 
          Simply enter the batch size and submit to begin processing.
        </Text>
        <FormContainer as="form" onSubmit={handleSubmit}>
          <Input
            placeholder="Enter batch size"
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
            keyboardType="numeric"
          />
          <Button type="submit" themeInverse>
            Process Batch
          </Button>
        </FormContainer>
        {processingStatus && (
          <Text color="$color" marginTop="$medium">
            {processingStatus}
          </Text>
        )}
      </Section>
      <Section>
        <Text tag="h2" fontSize={24}>
          Features
        </Text>
        <Text>
          - High-speed processing using advanced AI algorithms
          - Scalable architecture to handle various batch sizes
          - Real-time progress tracking and status updates
          - Secure data handling and processing
        </Text>
      </Section>
      <View
        tag="footer"
        padding="$large"
        justifyContent="center"
        marginTop="auto"
        paddingTop={100}
      >
        <Text tag="p" fontSize={16}>
          © {new Date().getFullYear()} AI Batch Processing Service
        </Text>
      </View>
    </View>
  )
}
