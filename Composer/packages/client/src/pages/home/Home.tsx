// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useContext, useEffect } from 'react';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { RouteComponentProps } from '@reach/router';
import { navigate } from '@reach/router';

import { StoreContext } from '../../store';
import { CreationFlowStatus } from '../../constants';
import { ToolBar, IToolBarItem } from '../../components/ToolBar';

import * as home from './styles';
import { ItemContainer } from './ItemContainer';
import { RecentBotList } from './RecentBotList';
import { ExampleList } from './ExampleList';

const linksButtom = [
  {
    to: 'https://aka.ms/BF-Composer-Getting-Started',
    text: formatMessage('Getting Started'),
    css: home.linkInfo,
  },
  {
    to: 'https://aka.ms/bf-composer-docs-create-first-bot',
    text: formatMessage('Build your first bot'),
    css: home.linkInfo,
  },
];

const tutorials = [
  {
    title: formatMessage('5 Minute Intro'),
    content: formatMessage('Chris Whitten'),
    subContent: formatMessage('Apr 9, 2020'),
    href: 'https://aka.ms/bf-composer-tutorial-chris',
  },
  {
    title: formatMessage('Weather Bot'),
    content: formatMessage('Ben Brown'),
    subContent: formatMessage('Nov 12, 2019'),
    href: 'https://aka.ms/bf-composer-tutorial-ben',
  },
  {
    title: formatMessage('MSFT Ignite AI Show'),
    content: formatMessage('Vishwac Sena'),
    subContent: formatMessage('Jan 28, 2020'),
    href: 'https://aka.ms/bf-composer-tutorial-vishwac',
  },
];

const Home: React.FC<RouteComponentProps> = () => {
  const { state, actions } = useContext(StoreContext);
  const { botName, recentProjects, templateProjects } = state;
  const {
    openBotProject,
    setCreationFlowStatus,
    saveTemplateId,
    fetchRecentProjects,
    onboardingAddCoachMarkRef,
  } = actions;

  const onClickRecentBotProject = async (path) => {
    await openBotProject(path);
  };

  const onItemChosen = async (item) => {
    if (item && item.path) {
      await onClickRecentBotProject(item.path);
    }
  };

  const onClickTemplate = async (id: string) => {
    await saveTemplateId(id);
    setCreationFlowStatus(CreationFlowStatus.NEW_FROM_TEMPLATE);
    navigate(`projects/create/${id}`);
  };

  const addButton = <Icon iconName="Add" styles={home.button} />;

  const addRef = useCallback((project) => onboardingAddCoachMarkRef({ project }), []);

  const toolbarItems: IToolBarItem[] = [
    {
      type: 'action',
      text: formatMessage('New'),
      buttonProps: {
        iconProps: {
          iconName: 'CirclePlus',
        },
        onClick: () => {
          setCreationFlowStatus(CreationFlowStatus.NEW);
          navigate(`projects/create`);
        },
      },
      align: 'left',
      dataTestid: 'homePage-ToolBar-New',
      disabled: false,
    },
    {
      type: 'action',
      text: formatMessage('Open'),
      buttonProps: {
        iconProps: {
          iconName: 'OpenFolderHorizontal',
        },
        onClick: () => {
          setCreationFlowStatus(CreationFlowStatus.OPEN);
          navigate(`projects/open`);
        },
      },
      align: 'left',
      dataTestid: 'homePage-ToolBar-Open',
      disabled: false,
    },
    {
      type: 'action',
      text: formatMessage('Save as'),
      buttonProps: {
        iconProps: {
          iconName: 'Save',
        },
        onClick: () => {
          setCreationFlowStatus(CreationFlowStatus.SAVEAS);
          navigate(`projects/${state.projectId}/${state.templateId}/save`);
        },
      },
      align: 'left',
      disabled: botName ? false : true,
    },
  ];

  useEffect(() => {
    fetchRecentProjects();
  }, []);

  return (
    <div css={home.outline}>
      <ToolBar toolbarItems={toolbarItems} />
      <div css={home.page}>
        <div css={home.leftPage} role="main">
          <h1 css={home.title}>{formatMessage(`Bot Framework Composer`)}</h1>
          <div aria-label={formatMessage('Composer introduction')} css={home.introduction} role="region">
            {formatMessage(
              'Bot Framework Composer is an integrated development environment (IDE) for building bots and other types of conversational software with the Microsoft Bot Framework technology stack.'
            )}
          </div>
          <div css={home.newBotContainer}>
            <div data-testid={'homePage-body-New'}>
              <ItemContainer
                ariaLabel={formatMessage('Create new empty bot')}
                content={formatMessage('New')}
                styles={home.newBotItem}
                title={addButton}
                onClick={() => {
                  setCreationFlowStatus(CreationFlowStatus.NEW);
                  navigate('projects/create');
                }}
              />
            </div>
            {recentProjects.length > 0 ? (
              <ItemContainer
                ariaLabel={recentProjects[0].name}
                content={recentProjects[0].name}
                forwardedRef={addRef}
                styles={home.latestBotItem}
                title={''}
                onClick={async () => {
                  await onClickRecentBotProject(recentProjects[0].path);
                }}
              />
            ) : (
              <ItemContainer
                ariaLabel={'ToDo bot with LUIS'}
                content={'ToDoBotWithLuis'}
                forwardedRef={addRef}
                styles={home.latestBotItem}
                title={''}
                onClick={() => {
                  onClickTemplate('ToDoBotWithLuisSample');
                }}
              />
            )}
          </div>
          {recentProjects.length > 0 && (
            <div css={home.leftContainer}>
              <h2 css={home.subtitle}>{formatMessage(`Recent Bots`)}</h2>
              <RecentBotList
                recentProjects={recentProjects}
                onItemChosen={async (item) => {
                  await onItemChosen(item);
                }}
              />
            </div>
          )}
          <div css={home.leftContainer}>
            <h2 css={home.subtitle}>{formatMessage('Video tutorials:')}&nbsp;</h2>
            <div css={home.newBotContainer}>
              {tutorials.map((item, index) => (
                <ItemContainer
                  key={index}
                  ariaLabel={item.title}
                  content={item.content}
                  href={item.href}
                  rel="noopener nofollow"
                  styles={home.tutorialTile}
                  subContent={item.subContent}
                  target="_blank"
                  title={item.title}
                />
              ))}
              <div css={home.linkContainer}>
                <div>
                  {formatMessage(
                    'Bot Framework provides the most comprehensive experience for building conversational applications.'
                  )}
                </div>
                {linksButtom.map((link) => {
                  return (
                    <Link
                      key={'homePageLeftLinks-' + link.text}
                      href={link.to}
                      rel="noopener noreferrer"
                      style={{ width: '150px' }}
                      tabIndex={0}
                      target="_blank"
                    >
                      <div css={link.css}>{link.text}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div aria-label={formatMessage('Example bot list')} css={home.rightPage} role="region">
          <h3 css={home.bluetitle}>{formatMessage(`Examples`)}</h3>
          <p css={home.examplesDescription}>
            {formatMessage(
              "These examples bring together all of the best practices and supporting components we've identified through building of conversational experiences."
            )}
          </p>
          <ExampleList examples={templateProjects} onClick={onClickTemplate} />
        </div>
      </div>
    </div>
  );
};

export default Home;
