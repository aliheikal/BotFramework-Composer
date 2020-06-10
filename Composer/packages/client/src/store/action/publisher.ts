// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
// import { ResourceManagementClient } from '@azure/arm-resources';
import axios from 'axios';

import { navigateTo, getAccessTokenInCache } from '../../utils';
import { AZURE_LOGIN_CONFIG } from '../../constants';
import { ActionCreator } from '../types';
import { loginPopup, getAccessTokenByCode } from '../../utils/auth';

import { ActionTypes } from './../../constants/index';
import httpClient from './../../utils/httpUtil';

export const getPublishTargetTypes: ActionCreator = async ({ dispatch }) => {
  try {
    const response = await httpClient.get(`/publish/types`);
    dispatch({
      type: ActionTypes.GET_PUBLISH_TYPES_SUCCESS,
      payload: {
        typelist: response.data,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: err,
    });
  }
};

export const getSubscriptions: ActionCreator = async ({ dispatch }) => {
  try {
    const token = getAccessTokenInCache();
    const result = await httpClient.post('/publish/subscriptions', { accessToken: token });
    console.log(result);
    // set to store
    // update subscription to state
  } catch (err) {
    // need authentication
    const result = await loginPopup(
      `${AZURE_LOGIN_CONFIG.BASEURL}/${AZURE_LOGIN_CONFIG.TANENT}/oauth2/v2.0/authorize?client_id=${AZURE_LOGIN_CONFIG.CLIENT_ID}&response_type=${AZURE_LOGIN_CONFIG.RESPONSE_TYPE}&response_mode=${AZURE_LOGIN_CONFIG.RESPONSE_MODE}&scope=${AZURE_LOGIN_CONFIG.SCOPE}&nonce=678910&redirect_uri=${AZURE_LOGIN_CONFIG.REDIRECT_URI}`
    );
    console.log(result);
    if (result) {
      await getAccessTokenByCode(result);
    }
    throw err;
  }
};

export const provision: ActionCreator = async ({ dispatch }, provisionSettings) => {
  try {
    const response = await httpClient.post('/publish/provision', provisionSettings);
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

export const publishToTarget: ActionCreator = async ({ dispatch }, projectId, target, metadata, sensitiveSettings) => {
  try {
    const response = await httpClient.post(`/publish/${projectId}/publish/${target.name}`, {
      metadata,
      sensitiveSettings,
    });
    dispatch({
      type: ActionTypes.PUBLISH_SUCCESS,
      payload: {
        ...response.data,
        target: target,
      },
    });
  } catch (err) {
    // special case to handle dotnet issues
    if (
      /(Command failed: dotnet user-secrets)|(install[\w\r\s\S\t\n]*\.NET Core SDK)/.test(
        err.response?.data?.message as string
      )
    ) {
      dispatch({
        type: ActionTypes.PUBLISH_FAILED_DOTNET,
        payload: {
          error: {
            message: formatMessage('To run this bot, Composer needs .NET Core SDK.'),
            linkAfterMessage: {
              text: formatMessage('Learn more.'),
              url: 'https://docs.microsoft.com/en-us/composer/setup-yarn',
            },
            link: {
              text: formatMessage('Install Microsoft .NET Core SDK'),
              url: 'https://dotnet.microsoft.com/download/dotnet-core/3.1',
            },
          },
          target: target,
        },
      });
    } else
      dispatch({
        type: ActionTypes.PUBLISH_FAILED,
        payload: {
          error: err.response.data,
          target: target,
        },
      });
  }
};

export const rollbackToVersion: ActionCreator = async ({ dispatch }, projectId, target, version, sensitiveSettings) => {
  try {
    const response = await httpClient.post(`/publish/${projectId}/rollback/${target.name}`, {
      version,
      sensitiveSettings,
    });
    dispatch({
      type: ActionTypes.PUBLISH_SUCCESS,
      payload: {
        ...response.data,
        target: target,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.PUBLISH_FAILED,
      payload: {
        error: err.response.data,
        target: target,
      },
    });
  }
};

// get bot status from target publisher
export const getPublishStatus: ActionCreator = async ({ dispatch }, projectId, target) => {
  try {
    const response = await httpClient.get(`/publish/${projectId}/status/${target.name}`);
    dispatch({
      type: ActionTypes.GET_PUBLISH_STATUS,
      payload: {
        ...response.data,
        target: target,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.GET_PUBLISH_STATUS_FAILED,
      payload: {
        ...err.response.data,
        target: target,
      },
    });
  }
};

export const getPublishHistory: ActionCreator = async ({ dispatch }, projectId, target) => {
  try {
    const response = await httpClient.get(`/publish/${projectId}/history/${target.name}`);
    dispatch({
      type: ActionTypes.GET_PUBLISH_HISTORY,
      payload: {
        history: response.data,
        target: target,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: err,
    });
  }
};
