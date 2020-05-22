import * as t from '@babel/types';

import { convertTypeParameterDeclaration } from './convertTypeParameterDeclaration';
import { convertObjectTypeProperty } from './convertObjectTypeProperty';
import { baseNodeProps } from '../utils/baseNodeProps';
import { convertObjectTypeCallProperty } from './convertObjectTypeCallProperty';
import { convertObjectTypeIndexer } from './convertObjectTypeIndexer';
import { convertObjectTypeInternalSlot } from './convertObjectTypeInternalSlot';
import { convertInterfaceExtends } from './convertInterfaceExtends';

export function convertInterfaceDeclaration(
  node: t.InterfaceDeclaration | t.DeclareInterface
) {
  let typeParameters = null;
  if (node.typeParameters) {
    typeParameters = {
      ...convertTypeParameterDeclaration(node.typeParameters),
      ...baseNodeProps(node.typeParameters),
    };
  }
  let extendsCombined: Array<t.InterfaceExtends | t.ClassImplements> = [];
  if (node.extends && node.implements) {
    if (
      node.extends.length &&
      node.implements.length &&
      node.extends[0].start &&
      node.implements[0].start &&
      node.extends[0].start < node.implements[0].start
    ) {
      extendsCombined = [...node.extends, ...node.implements];
    } else {
      extendsCombined = [...node.implements, ...node.extends];
    }
  } else {
    if (node.extends) {
      extendsCombined = node.extends;
    }
    if (node.implements) {
      extendsCombined = node.implements;
    }
  }
  let _extends = undefined;

  if (extendsCombined.length > 0) {
    _extends = extendsCombined.map(v => ({
      ...convertInterfaceExtends(v),
      ...baseNodeProps(v),
    }));
  }

  const bodyElements = [];

  for (const property of node.body.properties) {
    if (t.isObjectTypeProperty(property)) {
      bodyElements.push({
        ...convertObjectTypeProperty(property),
        ...baseNodeProps(property),
      });
    }
  }
  if (node.body.callProperties) {
    bodyElements.push(
      ...node.body.callProperties.map(v => ({
        ...convertObjectTypeCallProperty(v),
        ...baseNodeProps(v),
      }))
    );
  }
  if (node.body.indexers) {
    bodyElements.push(
      ...node.body.indexers.map(v => ({
        ...convertObjectTypeIndexer(v),
        ...baseNodeProps(v),
      }))
    );
  }
  if (node.body.internalSlots) {
    bodyElements.push(
      ...node.body.internalSlots.map(v => ({
        ...convertObjectTypeInternalSlot(v),
        ...baseNodeProps(v),
      }))
    );
  }
  const body = {
    ...t.tsInterfaceBody(bodyElements),
    ...baseNodeProps(node.body),
  };

  return t.tsInterfaceDeclaration(node.id, typeParameters, _extends, body);
}
