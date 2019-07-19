echo "starting tests..."
npm test

echo "cleanup"
rm -rf '/appsrc/ai/__pycache__/*'
rm -rf '/appsrc/ai/metalearning/__pycache__/*'
