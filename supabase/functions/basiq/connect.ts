// Supabase Edge Function for Basiq API connection
// This function serves as a middleware to avoid CORS issues when connecting to Basiq API

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// Basiq API configuration
const BASIQ_API_URL = 'https://au-api.basiq.io'
const BASIQ_API_KEY = Deno.env.get('BASIQ_API_KEY')

// Helper function to get a token from Basiq API
async function getBasiqToken() {
  try {
    const response = await fetch(`${BASIQ_API_URL}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(BASIQ_API_KEY + ':')}`,
        'Content-Type': 'application/json',
        'basiq-version': '3.0'
      },
      body: JSON.stringify({
        scope: 'SERVER_ACCESS'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error getting Basiq token:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`Failed to get token: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error in getBasiqToken:', error)
    throw error
  }
}

// Main handler function
serve(async (req) => {
  // Enable CORS
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json'
  })

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers }
      )
    }

    // Check if API key is configured
    if (!BASIQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Basiq API key not configured on the server' }),
        { status: 500, headers }
      )
    }

    // Parse request body
    const body = await req.json()
    const { email, firstName, lastName, mobile } = body

    // Validate required fields
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers }
      )
    }

    // Get access token
    const token = await getBasiqToken()

    // 1. Create user in Basiq
    const createUserResponse = await fetch(`${BASIQ_API_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'basiq-version': '3.0'
      },
      body: JSON.stringify({
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        mobile: mobile || ''
      })
    })

    if (!createUserResponse.ok) {
      const errorText = await createUserResponse.text()
      console.error('Error creating Basiq user:', {
        status: createUserResponse.status,
        statusText: createUserResponse.statusText,
        body: errorText
      })
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create user in Basiq',
          details: errorText
        }),
        { status: createUserResponse.status, headers }
      )
    }

    const userData = await createUserResponse.json()
    const userId = userData.id

    // 2. Generate connection link
    const linkResponse = await fetch(`${BASIQ_API_URL}/users/${userId}/connections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'basiq-version': '3.0'
      },
      body: JSON.stringify({
        // You can add specific institution ID here if needed
        // institutionId: 'AU00000'
      })
    })

    if (!linkResponse.ok) {
      const errorText = await linkResponse.text()
      console.error('Error generating connection link:', {
        status: linkResponse.status,
        statusText: linkResponse.statusText,
        body: errorText
      })
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate connection link',
          details: errorText
        }),
        { status: linkResponse.status, headers }
      )
    }

    const linkData = await linkResponse.json()

    // Return the user ID and connection link to the client
    return new Response(
      JSON.stringify({
        userId: userId,
        connectionData: linkData
      }),
      { status: 200, headers }
    )
  } catch (error) {
    console.error('Error in Basiq connect function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers }
    )
  }
})
