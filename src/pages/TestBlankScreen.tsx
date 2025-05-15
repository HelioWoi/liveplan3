import React from 'react';

export default function TestBlankScreen() {
  console.log('TestBlankScreen component rendered');
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p className="mb-4">If you can see this page, the basic React rendering is working.</p>
      <p>This is a diagnostic page to help troubleshoot blank screen issues.</p>
    </div>
  );
}
