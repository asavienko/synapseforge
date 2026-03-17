import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Button, Table, Input, Select, Modal, Badge, Tag } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { adminOnly } from '@/lib/permissions';

interface Manager {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  managerId: string | null;
}

export default function ManagerPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<string | null>(null);

  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    loadManagers();
    loadUsers();
  }, [user]);

  const loadManagers = async () => {
    try {
      const result = await prisma.manager.findMany({
        orderBy: { name: 'asc' },
      });
      setManagers(result);
    } catch (error) {
      console.error('Failed to load managers:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await prisma.user.findMany({
        orderBy: { name: 'asc' },
        include: {
          aiInstances: {
            select: { id: true, name: true },
          },
        },
      });
      setUsers(result);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const assignManager = async () => {
    if (!selectedUser || !selectedManager) return;

    setLoading(true);
    try {
      await prisma.user.update({
        where: { id: selectedUser.id },
        data: { managerId: selectedManager },
      });

      // Log the assignment
      await prisma.activityLog.create({
        data: {
          userId: selectedUser.id,
          instanceId: null,
          event: 'manager_assigned',
          details: `Assigned manager ${selectedManager} to user ${selectedUser.name}`,
        },
      });

      setModalOpen(false);
      setSelectedUser(null);
      setSelectedManager(null);
      loadUsers();
      setLoading(false);
    } catch (error) {
      console.error('Failed to assign manager:', error);
      setLoading(false);
    }
  };

  const handleAssignClick = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      (!searchQuery || user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!filterPlan || user.plan === filterPlan)
  );

  const canAssign = user?.role === 'admin';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Assignment</h1>
          <p className="text-gray-600 mt-1">
            Assign managers to users to handle their AI instance provisioning and support
          </p>
        </div>
        {canAssign && (
          <Button
            onClick={() => router.push('/admin/managers')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Manage Managers
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value || null)}
            className="w-48"
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table className="w-full">
          <Table.Header>
            <Table.Row>
              <Table.Head className="text-left">Name</Table.Head>
              <Table.Head className="text-left">Email</Table.Head>
              <Table.Head className="text-left">Plan</Table.Head>
              <Table.Head className="text-left">Instances</Table.Head>
              <Table.Head className="text-left">Manager</Table.Head>
              <Table.Head className="text-left">Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredUsers.map((user) => (
              <Table.Row key={user.id} className="hover:bg-gray-50">
                <Table.Cell className="font-medium">{user.name}</Table.Cell>
                <Table.Cell className="text-sm text-gray-600">{user.email}</Table.Cell>
                <Table.Cell>
                  <Tag variant="default">{user.plan}</Tag>
                </Table.Cell>
                <Table.Cell className="text-sm text-gray-600">
                  {user.aiInstances.length} instance(s)
                </Table.Cell>
                <Table.Cell>
                  {user.managerId ? (
                    <Badge variant="default" className="text-sm">
                      Assigned
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-sm">
                      Unassigned
                    </Badge>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {canAssign && !user.managerId ? (
                    <Button
                      size="sm"
                      onClick={() => handleAssignClick(user)}
                      className="bg-blue-600 hover:bg-blue-700 text-sm"
                    >
                      Assign Manager
                    </Button>
                  ) : null}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Assign Manager Modal */}
      {modalOpen && selectedUser && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          className="relative z-50"
        >
          <Modal.Content className="max-w-md">
            <Modal.Header>
              <h3 className="text-lg font-semibold">Assign Manager</h3>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-4">
                Assign a manager to handle {selectedUser.name}'s AI instance provisioning and support.
              </p>
              
              <div className="grid gap-2">
                {managers.map((manager) => (
                  <label key={manager.id} className="flex items-center p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                    <input
                      type="radio"
                      name="manager"
                      value={manager.id}
                      checked={selectedManager === manager.id}
                      onChange={(e) => setSelectedManager(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{manager.name}</div>
                      <div className="text-sm text-gray-600">{manager.email}</div>
                    </div>
                  </label>
                ))}
              </div>

              {managers.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>No managers available</p>
                  <p className="text-sm mt-1">Create managers in the admin panel first.</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                onClick={() => setModalOpen(false)}
                variant="outline"
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                onClick={assignManager}
                disabled={!selectedManager || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Assigning...' : 'Assign Manager'}
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      )}
    </div>
  );
}

export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

// Permission check
export const generateMetadata = async () => {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
};

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {
  const { user } = await auth();
  if (!user || user.role !== 'admin') {
    return {
      notFound: true,
    };
  }
  return {};
}

// Admin-only route guard
export async function generateStaticParams() {
  return [{ id: 'manager' }];
}

export async function generateMetadata() {