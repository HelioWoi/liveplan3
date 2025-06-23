import { motion } from 'framer-motion';

import { BudgetSummary, TopBar } from './components';
import WeeklyBudget from '../../components/home/WeeklyBudget';
import AnimatedCard from '../../components/common/AnimatedCard';
import TopGoals from '../../components/TopGoals';
import UpcomingBills from '../../components/home/UpcomingBills';
import Formula3 from './components/Formula3';

function Home() {
  
  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50"
      >
        <TopBar />
      
        <BudgetSummary />

        <div className="max-w-3xl mx-auto px-4 space-y-6 mt-6">
          <div className="grid grid-cols-1 gap-6">
              <div className="bg-white rounded-lg shadow-sm">
                <WeeklyBudget />
              </div>
              <div className="bg-white rounded-lg shadow-sm">
                <Formula3 />
              </div>
              <AnimatedCard>
                <TopGoals />
              </AnimatedCard>
              <div className="bg-white rounded-lg shadow-sm">
                <UpcomingBills />
              </div>
          </div>
        </div>
    </motion.div>
  );
}

export default Home;