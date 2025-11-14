import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Goal {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority?: 'low' | 'medium' | 'high';
}

interface AgentGoalsProps {
  goals?: Goal[];
}

export default function AgentGoals({ goals = [] }: AgentGoalsProps) {
  // Demo goals for UI
  const demoGoals: Goal[] = goals.length > 0 ? goals : [
    {
      id: '1',
      title: 'Exit starting house',
      status: 'completed',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Talk to Professor Birch',
      status: 'in-progress',
      priority: 'high',
    },
    {
      id: '3',
      title: 'Choose starter Pokémon',
      status: 'pending',
      priority: 'high',
    },
    {
      id: '4',
      title: 'Navigate to Route 101',
      status: 'pending',
      priority: 'medium',
    },
    {
      id: '5',
      title: 'Defeat first wild Pokémon',
      status: 'pending',
      priority: 'medium',
    },
    {
      id: '6',
      title: 'Reach Oldale Town',
      status: 'pending',
      priority: 'low',
    },
  ];

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in-progress':
        return '⟳';
      case 'failed':
        return '✗';
      default:
        return '○';
    }
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in-progress':
        return 'text-blue-500 animate-spin';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityBadge = (priority?: Goal['priority']) => {
    if (!priority) return null;
    
    const colors = {
      high: 'bg-transparent text-red-500 border-red-500/20',
      medium: 'bg-transparent text-yellow-500 border-yellow-500/20',
      low: 'bg-transparent text-gray-500 border-gray-800',
    };

    const labels = {
      high: 'High',
      medium: 'Med',
      low: 'Low',
    };

    return (
      <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${colors[priority]}`}>
        {labels[priority]}
      </Badge>
    );
  };

  return (
    <Card className="h-full flex flex-col bg-black border-gray-900">
      <CardHeader className="pb-3 border-b border-gray-900">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-300">
          <span className="text-base">🎯</span>
          <span>Goals</span>
        </CardTitle>
        <p className="text-xs text-gray-600 mt-0.5">
          Current objectives
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-1.5">
            {demoGoals.map((goal) => (
              <div
                key={goal.id}
                className={`p-2.5 rounded-md border transition-all ${
                  goal.status === 'in-progress'
                    ? 'bg-blue-500/5 border-blue-500/20'
                    : goal.status === 'completed'
                    ? 'bg-gray-950/50 border-gray-900 opacity-60'
                    : 'bg-gray-950/30 border-gray-900 hover:border-gray-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`text-xs mt-0.5 ${getStatusColor(goal.status)}`}
                  >
                    {getStatusIcon(goal.status)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p
                        className={`text-xs font-medium ${
                          goal.status === 'completed'
                            ? 'text-gray-600 line-through'
                            : 'text-gray-400'
                        }`}
                      >
                        {goal.title}
                      </p>
                      {getPriorityBadge(goal.priority)}
                    </div>
                    {goal.status === 'in-progress' && (
                      <p className="text-[10px] text-blue-500 animate-pulse">In progress...</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

