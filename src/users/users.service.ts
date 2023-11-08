import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { GraphQLError } from 'graphql';
import { UserResponseDTO } from './dto/user-response-dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('user') private userModel: Model<User>) {}

  /**
   *
   * @param userDetails This is the json which contains the user details as mentioned in the CreateUserDto class
   * @returns the user details if created successfully else returns the error message
   */
  async create(userDetails: CreateUserInput): Promise<any> {
    try {
      //finding a user with the given email
      const existingUser = await this.userModel
        .findOne({
          email: userDetails.email,
        })
        .exec();

      if (existingUser) {
        // user already exists
        throw new GraphQLError('User with this email already exists', {
          extensions: {
            code: HttpStatus.BAD_REQUEST,
          },
        });
      }

      //create the user if doesnt exist
      const user = new this.userModel(userDetails);
      return await user.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param email - The email of the user whose details is requested
   * @returns - The user if found otherwise null
   */
  async getUserByEmail(email: string): Promise<UserResponseDTO> {
    try {
      return await this.userModel.findOne({
        email,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param startId This is the id of the user from which the users-fetch will start.
   * All the documents which have a Id lesser than this(in other words created before this document) will be skipped.
   * The default value of startdId is null to prevent any user from being skipped
   * @param skip The param to skip the first n user documents from the @param startdId
   * The default value of skip us 0
   * @param limit The param to limit the results to first n user documents
   * The default value of limit is 10
   * @returns the list of users using the given params or default value
   */
  async findAll(
    startId: string = null,
    skip = 0,
    limit = 10,
  ): Promise<UserResponseDTO[]> {
    try {
      let query: any;
      if (!startId) query = {};
      else {
        //check if the given objectId is valid
        this.isObjectId(startId);
        query = {
          _id: {
            $gt: new Types.ObjectId(startId), // using keyset pagination to fetch users faster
          },
        };
      }

      const res = await this.userModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .exec();
      return res;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param _id This is the id of the user whose details is to be fetched
   * @returns the user details if found
   */
  async findOneById(_id: string): Promise<UserResponseDTO> {
    try {
      //check if the given objectId is valid
      this.isObjectId(_id);
      return await this.userModel.findById(_id).exec();
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param _id The id of the user to be updated
   * @param updateUserDto This is the json which contains the fields/ properties of the user to be updated
   * @returns the updated user details
   */
  async update(
    _id: string,
    updateUserDto: UpdateUserInput,
  ): Promise<UserResponseDTO> {
    try {
      //check if the given objectId is valid
      this.isObjectId(_id);
      //fetching the user details
      const user = await this.userModel.findById(_id).exec();
      //asigning the new values
      Object.assign(user, updateUserDto);
      await user.save();

      //retreiving from mongo _.doc object
      const newUser: any = { ...user };
      //removing the password before sending the user details
      delete newUser._doc.password;
      return newUser._doc;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param _id This is the id of the user to be deleted
   * @returns the mongodb result after executing the delete query
   */
  async remove(_id: string) {
    try {
      //check if the given objectId is valid
      this.isObjectId(_id);
      const query = { _id };
      return await this.userModel.deleteOne(query).exec();
    } catch (error) {
      throw error;
    }
  }
  /**
   * This function is not exposed to external users and is available ONLY for internal use
   * @param email This is the email for finding the user details
   * @param showPassword - based on this boolean value the password is included or excluded from the response
   * Also if @param showPassword is true the password is returned
   * @returns a user with the given email.
   */
  async findByEmailWithPassword(
    email: string,
    showPassword: boolean = false,
  ): Promise<UserResponseDTO> {
    try {
      //to include or exclude the password from response
      const selectPassword = showPassword ? '+password' : '-password';
      const user = await this.userModel
        .findOne({ email })
        .select(selectPassword)
        .exec();
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param emails - This is the list of emails to fetch list of users
   * @returns a list of users whose email matches with the user email in our mongoDB
   */
  async findUserByEmails(emails: string[]): Promise<UserResponseDTO[]> {
    try {
      const userArr = await this.userModel
        .find({
          email: {
            $in: emails,
          },
        })
        .exec();
      return userArr;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param _id is the id we receive in the request url from the user
   * This fucntion will check if this id is a valid ObjectId
   * Else this will throw an error
   */
  isObjectId(_id) {
    try {
      if (!Types.ObjectId.isValid(_id))
        throw new GraphQLError('Invalid Id', {
          extensions: {
            code: HttpStatus.BAD_REQUEST,
          },
        });
    } catch (error) {
      throw error;
    }
  }
}
