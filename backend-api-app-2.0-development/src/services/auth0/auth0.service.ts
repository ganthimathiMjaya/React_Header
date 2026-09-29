import { ManagementClient, CreateUserData } from 'auth0';

const domain = process.env.AUTH0_SCRAPPY_BASE_URL || 'scrappy-dev.us.auth0.com';
const clientId = process.env.AUTH0_CLIENT_ID || '';
const clientSecret = process.env.AUTH0_CLIENT_SECRET || '';

const management = new ManagementClient({
  domain,
  clientId,
  clientSecret,
});

export const connection = 'Username-Password-Authentication';

export class Auth0Service {
  async createUser(
    orgId: string,
    userData: CreateUserData,
    auth0RoleId: string
  ) {
    //Create user
    const newUser = await management.createUser(userData);
    const auth0Id = newUser?.user_id;
    if (auth0Id) {
      //Assign user to org
      await management.organizations.addMembers(
        { id: orgId },
        { members: [auth0Id] }
      );
      //Assign role in org to user
      await management.organizations.addMemberRoles(
        { id: orgId, user_id: auth0Id },
        { roles: [auth0RoleId] }
      );
    }
    return newUser;
  }

  async getPasswordResetLink(orgId: string, email: string) {
    const connectionId = await this.getConnectionId(connection);
    const body = {
      email,
      connection_id: connectionId,
      organization_id: orgId,
      ttl_sec: 0,
      mark_email_as_verified: false,
      includeEmailInRedirect: true,
    };
    return management.createPasswordChangeTicket(body);
  }

  async getConnectionId(name: string) {
    const connections = await this.getConnections();
    const usernameDbCon = connections.find((item) => item.name === name);
    return usernameDbCon ? usernameDbCon.id : '';
  }

  async getConnections() {
    return management.getConnections();
  }

  async getOrgName(orgId: string) {
    const organization = await management.organizations.getByID({ id: orgId });
    return organization.display_name;
  }

  async getRoles() {
    return management.getRoles();
  }

  async getRoleByName(roleName: string) {
    const auth0Roles = await this.getRoles();
    return auth0Roles.find((role) => role.name === roleName);
  }

  async getUser(id: string) {
    return management.getUser({ id });
  }
}
