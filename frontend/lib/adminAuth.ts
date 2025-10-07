import { NextApiRequest, NextApiResponse } from 'next';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';

export async function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      res.status(401).json({ error: 'Authentication required' });
      return null;
    }

    // Check if user is admin
    if (!(session.user as any)?.is_admin) {
      res.status(403).json({ error: 'Admin access required' });
      return null;
    }

    return session;
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
    return null;
  }
}

// Simplified server-side props helper - DON'T pass session in props
export async function requireAdminProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ [key: string]: any }>> {
  try {
    const session = await getServerSession(context.req, context.res, authOptions);
    
    if (!session) {
      return {
        redirect: {
          destination: '/login?callbackUrl=' + encodeURIComponent(context.resolvedUrl),
          permanent: false,
        },
      };
    }

    if (!(session.user as any)?.is_admin) {
      return {
        redirect: {
          destination: '/?error=access_denied',
          permanent: false,
        },
      };
    }

    // Return empty props - we don't pass session to avoid serialization issues
    return {
      props: {},
    };
  } catch (error) {
    console.error('Admin props auth error:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}
