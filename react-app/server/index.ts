import express from 'express';
import cors from 'cors';
import { prisma } from '../src/services/database';
import { getUserInfo } from '../src/services/auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// логируем все запросы
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// middleware для проверки аутентификации
async function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = authHeader.substring(7);
  
  try {
    const userInfo = await getUserInfo(token);
    if (!userInfo) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // поиск и создание юзера в бд
    const user = await prisma.user.upsert({
      where: { yandexId: userInfo.id },
      update: {
        email: userInfo.default_email,
        displayName: userInfo.display_name,
        avatarUrl: userInfo.default_avatar_id 
          ? `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200` 
          : null,
      },
      create: {
        yandexId: userInfo.id,
        email: userInfo.default_email,
        displayName: userInfo.display_name,
        avatarUrl: userInfo.default_avatar_id 
          ? `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200` 
          : null,
      },
    });

    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// api endpoint для синхронизации юзера
app.post('/api/auth/sync', async (req, res) => {
  try {
    const { yandexId, email, displayName, avatarUrl } = req.body;

    if (!yandexId) {
      return res.status(400).json({ error: 'yandexId is required' });
    }

    const user = await prisma.user.upsert({
      where: { yandexId },
      update: {
        email,
        displayName,
        avatarUrl,
      },
      create: {
        yandexId,
        email,
        displayName,
        avatarUrl,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// api endpoints для workflows
app.get('/api/workflows', authenticateUser, async (req, res) => {
  try {
    const user = (req as any).user;
    const workflows = await prisma.workflow.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

app.post('/api/workflows', authenticateUser, async (req, res) => {
  try {
    console.log('POST /api/workflows - Request received');
    const user = (req as any).user;
    const { name, description, blocks } = req.body;

    console.log('Request body:', { name, description, blocksCount: blocks?.length || 0 });

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        blocks: blocks || [],
        userId: user.id,
      },
    });

    console.log('Workflow created:', workflow.id);
    res.json(workflow);
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

app.put('/api/workflows/:id', authenticateUser, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { name, description, blocks } = req.body;

    // workflow принадлежит юзеру - проверка
    const existingWorkflow = await prisma.workflow.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingWorkflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(blocks !== undefined && { blocks }),
      },
    });

    res.json(workflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ error: 'Failed to update workflow' });
  }
});

app.delete('/api/workflows/:id', authenticateUser, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    // workflow принадлежит юзеру - проверка
    const existingWorkflow = await prisma.workflow.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingWorkflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    await prisma.workflow.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

// api endpoint для получения информации о текущем юзере
app.get('/api/user', authenticateUser, async (req, res) => {
  try {
    const user = (req as any).user;
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

