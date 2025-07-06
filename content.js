try {
  const someObject = await getObject();
  someObject.switchAutoLaunch();
} catch (error) {
  console.error('Failed to get object:', error);
} 